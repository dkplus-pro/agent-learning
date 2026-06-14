"""对话（Conversation）数据库表定义。

每个对话代表用户与 AI 之间的一次完整聊天会话。
"""

from datetime import datetime
from uuid import uuid4

from sqlmodel import Field, SQLModel


class Conversation(SQLModel, table=True):
    """对话表，记录每次聊天的元数据。"""

    __tablename__ = "conversations"

    id: str = Field(
        primary_key=True,
        default_factory=lambda: str(uuid4()),  # 使用 UUID 作为主键，避免自增 ID 暴露
    )
    title: str = Field(default="新对话", max_length=200)  # 对话标题，默认「新对话」
    created_at: datetime = Field(default_factory=datetime.utcnow)  # 创建时间
    updated_at: datetime = Field(default_factory=datetime.utcnow)  # 最后更新时间（每次新消息时刷新）