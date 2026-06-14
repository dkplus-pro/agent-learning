"""Message CRUD routes."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import col, select

from database import get_session
from models import Conversation, Message
from schemas.message import MessageCreate, MessageRead

router = APIRouter(prefix="/api/messages", tags=["messages"])


@router.post("/", response_model=MessageRead)
async def create_message(
    data: MessageCreate,
    session: AsyncSession = Depends(get_session),
):
    """在会话中创建新消息。"""
    # Verify conversation exists
    conversation = await session.get(Conversation, data.conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    message = Message(
        conversation_id=data.conversation_id,
        role=data.role,
        content=data.content,
    )
    session.add(message)

    # Update conversation's updated_at
    from datetime import datetime
    conversation.updated_at = datetime.utcnow()
    session.add(conversation)

    await session.commit()
    await session.refresh(message)
    return message


@router.get("/{conversation_id}", response_model=list[MessageRead])
async def list_messages(
    conversation_id: str,
    session: AsyncSession = Depends(get_session),
):
    """列出会话中的所有消息，按创建时间升序排列。"""
    # Verify conversation exists
    conversation = await session.get(Conversation, conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    result = await session.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(col(Message.created_at).asc())
    )
    return result.scalars().all()


@router.delete("/{message_id}", status_code=204)
async def delete_message(
    message_id: str,
    session: AsyncSession = Depends(get_session),
):
    """删除单条消息。"""
    message = await session.get(Message, message_id)
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")

    await session.delete(message)
    await session.commit()
