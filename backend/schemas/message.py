"""消息 API 的 Pydantic Schema 定义。"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class MessageCreate(BaseModel):
    """创建消息的请求体，必须指定所属对话、角色和内容。"""

    conversation_id: str
    role: str = Field(pattern="^(user|assistant)$")  # 仅允许 "user" 或 "assistant"
    content: str = Field(min_length=1)                 # 内容不能为空


class MessageRead(BaseModel):
    """查询消息的响应体，包含消息的完整信息。"""

    model_config = ConfigDict(from_attributes=True)

    id: str
    conversation_id: str
    role: str
    content: str
    status: str
    created_at: datetime