"""Conversation CRUD routes."""

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import col, select

from database import get_session
from models import Conversation
from schemas import ConversationCreate, ConversationRead, ConversationUpdate

router = APIRouter(prefix="/api/conversations", tags=["conversations"])


@router.post("/", response_model=ConversationRead)
async def create_conversation(
    data: ConversationCreate,
    session: AsyncSession = Depends(get_session),
):
    """Create a new conversation."""
    conversation = Conversation(title=data.title)
    session.add(conversation)
    await session.commit()
    await session.refresh(conversation)
    return conversation


@router.get("/", response_model=list[ConversationRead])
async def list_conversations(
    session: AsyncSession = Depends(get_session),
):
    """List all conversations, ordered by updated_at descending."""
    result = await session.execute(
        select(Conversation).order_by(col(Conversation.updated_at).desc())
    )
    return result.scalars().all()


@router.get("/{conversation_id}", response_model=ConversationRead)
async def get_conversation(
    conversation_id: str,
    session: AsyncSession = Depends(get_session),
):
    """Get a single conversation by ID."""
    conversation = await session.get(Conversation, conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation


@router.patch("/{conversation_id}", response_model=ConversationRead)
async def update_conversation(
    conversation_id: str,
    data: ConversationUpdate,
    session: AsyncSession = Depends(get_session),
):
    """Update conversation title."""
    conversation = await session.get(Conversation, conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    conversation.title = data.title
    conversation.updated_at = datetime.utcnow()
    session.add(conversation)
    await session.commit()
    await session.refresh(conversation)
    return conversation


@router.delete("/{conversation_id}", status_code=204)
async def delete_conversation(
    conversation_id: str,
    session: AsyncSession = Depends(get_session),
):
    """Delete a conversation and all its messages."""
    conversation = await session.get(Conversation, conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Delete all messages in this conversation
    from models import Message
    result = await session.execute(
        select(Message).where(Message.conversation_id == conversation_id)
    )
    messages = result.scalars().all()
    for msg in messages:
        await session.delete(msg)

    await session.delete(conversation)
    await session.commit()
