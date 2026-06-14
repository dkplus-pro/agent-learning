"""Chat streaming API router with SSE."""

import json
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from database import async_session as _async_factory, get_session
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

    messages = [{"role": msg.role, "content": msg.content} for msg in history]

    system_prompt = None
    if request.tool_id:
        tool = get_tool(request.tool_id)
        if tool:
            system_prompt = tool.system_prompt

    async def event_generator():
        full_content = ""
        assistant_id = None

        try:
            # Create assistant message in a fresh session
            async with _async_factory() as s:
                assistant_msg = Message(
                    conversation_id=request.conversation_id,
                    role="assistant",
                    content="",
                    status=MessageStatus.COMPLETE,
                )
                s.add(assistant_msg)
                await s.commit()
                await s.refresh(assistant_msg)
                assistant_id = assistant_msg.id

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

            # Persist result in a fresh session
            async with _async_factory() as s:
                assistant = await s.get(Message, assistant_id)
                if assistant:
                    assistant.content = full_content
                    assistant.status = MessageStatus.COMPLETE
                    s.add(assistant)

                conv = await s.get(Conversation, request.conversation_id)
                if conv:
                    conv.updated_at = datetime.utcnow()
                    if len(history) <= 1:
                        new_title = request.message[:30] + ("..." if len(request.message) > 30 else "")
                        conv.title = new_title
                        yield f"data: {json.dumps({'type': 'title', 'title': new_title})}\n\n"
                    s.add(conv)

                await s.commit()

            yield f"data: {json.dumps({'type': 'done', 'message_id': assistant_id})}\n\n"

        except Exception as e:
            try:
                async with _async_factory() as s:
                    assistant = await s.get(Message, assistant_id)
                    if assistant:
                        assistant.content = full_content
                        assistant.status = MessageStatus.INTERRUPTED
                        s.add(assistant)
                        await s.commit()
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