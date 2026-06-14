"""Chat streaming API router with SSE."""

import json
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from database import get_session
from models import Conversation, Message, MessageStatus
from schemas.chat import ChatRequest
from tools.registry import get_tool

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("/stream")
async def stream_chat(
    request: ChatRequest,
    session: AsyncSession = Depends(get_session),
):
    """Stream chat response using SSE."""
    # Verify conversation exists
    conversation = await session.get(Conversation, request.conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Save user message
    user_msg = Message(
        conversation_id=request.conversation_id,
        role="user",
        content=request.message,
    )
    session.add(user_msg)
    await session.commit()

    # Load conversation history
    result = await session.execute(
        select(Message)
        .where(Message.conversation_id == request.conversation_id)
        .order_by(Message.created_at)
    )
    history = result.scalars().all()

    # Prepare messages for LLM
    messages = [{"role": msg.role, "content": msg.content} for msg in history]

    # Get tool or use default system prompt
    system_prompt = None
    if request.tool_id:
        tool = get_tool(request.tool_id)
        if tool:
            system_prompt = tool.system_prompt

    # Create assistant message placeholder
    assistant_msg = Message(
        conversation_id=request.conversation_id,
        role="assistant",
        content="",
        status=MessageStatus.COMPLETE,
    )
    session.add(assistant_msg)
    await session.commit()
    await session.refresh(assistant_msg)

    async def event_generator():
        """Generate SSE events."""
        full_content = ""

        try:
            # Stream response
            if request.tool_id:
                tool = get_tool(request.tool_id)
                if tool:
                    async for chunk in tool.handle(messages, request.tool_params):
                        full_content += chunk
                        yield f"data: {json.dumps({'type': 'chunk', 'content': chunk})}\n\n"
                else:
                    # Fallback to default chat
                    from services.llm_service import stream_chat as default_stream
                    async for chunk in default_stream(messages, system_prompt):
                        full_content += chunk
                        yield f"data: {json.dumps({'type': 'chunk', 'content': chunk})}\n\n"
            else:
                # Default chat without tool
                from services.llm_service import stream_chat as default_stream
                async for chunk in default_stream(messages, system_prompt):
                    full_content += chunk
                    yield f"data: {json.dumps({'type': 'chunk', 'content': chunk})}\n\n"

            # Update assistant message with full content
            assistant_msg.content = full_content
            assistant_msg.status = MessageStatus.COMPLETE
            session.add(assistant_msg)

            # Update conversation timestamp
            conversation.updated_at = datetime.utcnow()
            session.add(conversation)

            # Auto-generate title for first message
            if len(history) <= 1:  # Only user message
                new_title = request.message[:30] + ("..." if len(request.message) > 30 else "")
                conversation.title = new_title
                session.add(conversation)
                yield f"data: {json.dumps({'type': 'title', 'title': new_title})}\n\n"

            await session.commit()

            # Send done event
            yield f"data: {json.dumps({'type': 'done', 'message_id': assistant_msg.id})}\n\n"

        except Exception as e:
            # Handle error
            assistant_msg.content = full_content
            assistant_msg.status = MessageStatus.INTERRUPTED
            session.add(assistant_msg)
            await session.commit()

            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )
