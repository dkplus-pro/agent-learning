"""Chat API schemas."""

from pydantic import BaseModel


class ChatRequest(BaseModel):
    """Request body for streaming chat."""

    conversation_id: str
    message: str
    tool_id: str | None = None
    tool_params: dict | None = None
