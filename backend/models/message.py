"""Message table definition."""

from datetime import datetime
from enum import Enum
from uuid import uuid4

from sqlmodel import Field, SQLModel


class MessageStatus(str, Enum):
    """Status of a message."""

    COMPLETE = "complete"
    INTERRUPTED = "interrupted"


class Message(SQLModel, table=True):
    """A single message in a conversation."""

    __tablename__ = "messages"

    id: str = Field(
        primary_key=True,
        default_factory=lambda: str(uuid4()),
    )
    conversation_id: str = Field(foreign_key="conversations.id", index=True)
    role: str = Field(index=True)  # "user" | "assistant"
    content: str = Field(default="")
    status: str = Field(default=MessageStatus.COMPLETE)
    created_at: datetime = Field(default_factory=datetime.utcnow)
