"""Conversation API schemas."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ConversationCreate(BaseModel):
    """Request body for creating a conversation."""

    title: str = Field(default="新对话", max_length=200)


class ConversationUpdate(BaseModel):
    """Request body for updating a conversation."""

    title: str = Field(max_length=200)


class ConversationRead(BaseModel):
    """Response body for reading a conversation."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    created_at: datetime
    updated_at: datetime
