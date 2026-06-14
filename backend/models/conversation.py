"""Conversation table definition."""

from datetime import datetime
from uuid import uuid4

from sqlmodel import Field, SQLModel


class Conversation(SQLModel, table=True):
    """A conversation between user and AI agent."""

    __tablename__ = "conversations"

    id: str = Field(
        primary_key=True,
        default_factory=lambda: str(uuid4()),
    )
    title: str = Field(default="新对话", max_length=200)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
