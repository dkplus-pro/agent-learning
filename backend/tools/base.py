"""Tool handler base class and plugin system."""

from abc import ABC, abstractmethod
from typing import Any, AsyncIterator

from pydantic import BaseModel


class ToolParameter(BaseModel):
    """Tool parameter definition."""

    name: str
    type: str  # "string" | "number" | "boolean" | "array"
    description: str
    required: bool = False
    default: Any = None
    enum: list[str] | None = None


class ToolHandler(ABC):
    """Abstract base class for tool handlers."""

    name: str
    description: str
    system_prompt: str
    parameters: list[ToolParameter] = []

    @abstractmethod
    async def handle(
        self,
        messages: list[dict[str, str]],
        params: dict[str, Any] | None = None,
    ) -> AsyncIterator[str]:
        """
        Handle the tool invocation and yield response chunks.

        Args:
            messages: Conversation history [{"role": "user", "content": "..."}]
            params: Tool-specific parameters (e.g., {"target_lang": "en"})

        Yields:
            Response text chunks for SSE streaming
        """
        pass

    def to_dict(self) -> dict[str, Any]:
        """Convert tool metadata to dict for API response."""
        return {
            "id": self.name,
            "name": self.name,
            "description": self.description,
            "parameters": [p.model_dump() for p in self.parameters],
        }
