"""工具处理器的基类与插件系统。"""

from abc import ABC, abstractmethod
from typing import Any, AsyncIterator

from pydantic import BaseModel


class ToolParameter(BaseModel):
    """工具参数定义。"""

    name: str
    type: str  # "string" | "number" | "boolean" | "array"
    description: str
    required: bool = False
    default: Any = None
    enum: list[str] | None = None


class ToolHandler(ABC):
    """工具处理器的抽象基类。"""

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
        处理工具调用并以块的形式产出响应。

        Args:
            messages: 对话历史 [{"role": "user", "content": "..."}]
            params: 工具特定参数（例如 {"target_lang": "en"}）

        Yields:
            用于 SSE 流式传输的响应文本块
        """
        pass

    def to_dict(self) -> dict[str, Any]:
        """将工具元数据转换为字典，用于 API 响应。"""
        return {
            "id": self.name,
            "name": self.name,
            "description": self.description,
            "parameters": [p.model_dump() for p in self.parameters],
        }
