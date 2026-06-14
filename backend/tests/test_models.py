"""Tests for SQLModel table definitions."""

from datetime import datetime

import pytest
from sqlmodel import select

from models.conversation import Conversation
from models.message import Message, MessageStatus


@pytest.mark.asyncio
async def test_create_conversation(db_session):
    """Test creating a conversation."""
    conv = Conversation(title="测试对话")
    db_session.add(conv)
    await db_session.commit()
    await db_session.refresh(conv)

    assert conv.id is not None
    assert conv.title == "测试对话"
    assert isinstance(conv.created_at, datetime)
    assert isinstance(conv.updated_at, datetime)


@pytest.mark.asyncio
async def test_conversation_default_title(db_session):
    """Test that conversation gets default title."""
    conv = Conversation()
    db_session.add(conv)
    await db_session.commit()
    await db_session.refresh(conv)

    assert conv.title == "新对话"


@pytest.mark.asyncio
async def test_create_message(db_session):
    """Test creating a message."""
    conv = Conversation()
    db_session.add(conv)
    await db_session.commit()
    await db_session.refresh(conv)

    msg = Message(
        conversation_id=conv.id,
        role="user",
        content="Hello",
    )
    db_session.add(msg)
    await db_session.commit()
    await db_session.refresh(msg)

    assert msg.id is not None
    assert msg.conversation_id == conv.id
    assert msg.role == "user"
    assert msg.content == "Hello"
    assert msg.status == MessageStatus.COMPLETE


@pytest.mark.asyncio
async def test_message_default_status(db_session):
    """Test that message defaults to complete status."""
    conv = Conversation()
    db_session.add(conv)
    await db_session.commit()
    await db_session.refresh(conv)

    msg = Message(conversation_id=conv.id, role="assistant", content="Hi")
    db_session.add(msg)
    await db_session.commit()
    await db_session.refresh(msg)

    assert msg.status == "complete"


@pytest.mark.asyncio
async def test_query_messages_by_conversation(db_session):
    """Test querying messages by conversation_id."""
    conv = Conversation()
    db_session.add(conv)
    await db_session.commit()
    await db_session.refresh(conv)

    msg1 = Message(conversation_id=conv.id, role="user", content="Q1")
    msg2 = Message(conversation_id=conv.id, role="assistant", content="A1")
    db_session.add_all([msg1, msg2])
    await db_session.commit()

    result = await db_session.execute(
        select(Message).where(Message.conversation_id == conv.id).order_by(Message.created_at)
    )
    messages = result.scalars().all()

    assert len(messages) == 2
    assert messages[0].role == "user"
    assert messages[1].role == "assistant"
