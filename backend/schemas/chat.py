"""聊天 SSE 流式响应的 Pydantic Schema。"""

from pydantic import BaseModel


class ChatRequest(BaseModel):
    """流式聊天的请求体，包含对话 ID、消息内容、可选工具和参数。"""

    conversation_id: str
    message: str
    tool_id: str | None = None      # 可选：工具 ID（如 "writing"、"translate"）
    tool_params: dict | None = None # 可选：传递给工具的参数