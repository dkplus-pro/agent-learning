"""消息（Message）数据库表定义。

每条消息属于一个对话，包含用户发送或 AI 回应的文本内容。
"""

from datetime import datetime
from enum import Enum
from uuid import uuid4

from sqlmodel import Field, SQLModel


class MessageStatus(str, Enum):
    """消息状态枚举：COMPLETE 表示正常生成完毕，INTERRUPTED 表示被用户中断。"""

    COMPLETE = "complete"
    INTERRUPTED = "interrupted"


class Message(SQLModel, table=True):
    """消息表，记录每次对话中的单条消息。"""

    __tablename__ = "messages"

    id: str = Field(
        primary_key=True,
        default_factory=lambda: str(uuid4()),
    )
    conversation_id: str = Field(foreign_key="conversations.id", index=True)  # 所属对话 ID
    role: str = Field(index=True)  # 消息角色："user" 或 "assistant"
    content: str = Field(default="")  # 消息内容，支持 Markdown 格式
    status: str = Field(default=MessageStatus.COMPLETE)  # 生成状态
    created_at: datetime = Field(default_factory=datetime.utcnow)  # 创建时间