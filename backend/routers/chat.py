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
from services.llm_service import stream_chat as default_stream
from tools.registry import get_tool

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("/stream")
async def stream_chat(
    request: ChatRequest,
    session: AsyncSession = Depends(get_session),
):
    """Stream chat response using SSE.

    Uses the Depends-injected session for both pre-processing
    and post-streaming persistence.  FastAPI keeps the dependency
    alive until the StreamingResponse generator completes.
    """
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
    messages = [{"role": msg.role, "content": msg.content} for msg in history]

    system_prompt = None
    if request.tool_id:
        tool = get_tool(request.tool_id)
        if tool:
            system_prompt = tool.system_prompt

    async def event_generator():
        full_content = ""

        try:
            # Create assistant placeholder inside the generator
            assistant_msg = Message(
                conversation_id=request.conversation_id,
                role="assistant",
                content="",
                status=MessageStatus.COMPLETE,
            )
            session.add(assistant_msg)
            await session.commit()
            await session.refresh(assistant_msg)

            # Stream response
            if request.tool_id:
                tool = get_tool(request.tool_id)
                if tool:
                    async for chunk in tool.handle(messages, request.tool_params):
                        if chunk:
                            full_content += chunk
                            yield f"data: {json.dumps({'type': 'chunk', 'content': chunk})}\n\n"
                else:
                    async for chunk in default_stream(messages, system_prompt):
                        if chunk:
                            full_content += chunk
                            yield f"data: {json.dumps({'type': 'chunk', 'content': chunk})}\n\n"
            else:
                async for chunk in default_stream(messages, system_prompt):
                    if chunk:
                        full_content += chunk
                        yield f"data: {json.dumps({'type': 'chunk', 'content': chunk})}\n\n"

            # Save full content
            assistant_msg.content = full_content
            assistant_msg.status = MessageStatus.COMPLETE

            # Update conversation
            conversation.updated_at = datetime.utcnow()
            if len(history) <= 1:
                new_title = request.message[:30] + ("..." if len(request.message) > 30 else "")
                conversation.title = new_title
                yield f"data: {json.dumps({'type': 'title', 'title': new_title})}\n\n"

            await session.commit()
            yield f"data: {json.dumps({'type': 'done', 'message_id': assistant_msg.id})}\n\n"

        except Exception as e:
            try:
                assistant_msg.content = full_content
                assistant_msg.status = MessageStatus.INTERRUPTED
                await session.commit()
            except Exception:
                pass

            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )