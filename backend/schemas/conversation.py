"""对话 API 的 Pydantic Schema 定义。

分离请求体和响应体的数据结构，与数据库模型解耦。
"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ConversationCreate(BaseModel):
    """创建对话的请求体，只需提供可选标题。"""

    title: str = Field(default="新对话", max_length=200)


class ConversationUpdate(BaseModel):
    """更新对话的请求体，目前仅支持修改标题。"""

    title: str = Field(max_length=200)


class ConversationRead(BaseModel):
    """查询对话的响应体，包含完整的对话元数据。"""

    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    created_at: datetime
    updated_at: datetime