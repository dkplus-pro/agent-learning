"""Message API schemas."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class MessageCreate(BaseModel):
    """Request body for creating a message."""

    conversation_id: str
    role: str = Field(pattern="^(user|assistant)$")
    content: str = Field(min_length=1)


class MessageRead(BaseModel):
    """Response body for reading a message."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    conversation_id: str
    role: str
    content: str
    status: str
    created_at: datetime
