"""数据库连接与会话管理。

使用 aiosqlite 提供异步 SQLite 支持，通过 SQLAlchemy 的 async 引擎
和 sessionmaker 创建异步数据库会话。
"""

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from config import settings
from models import Conversation, Message  # noqa: F401 - 确保模型被 SQLAlchemy 注册

# 将 SQLite URL 转换为 aiosqlite 兼容的格式
DATABASE_URL = settings.database_url.replace("sqlite:///", "sqlite+aiosqlite:///")

# 创建异步数据库引擎和会话工厂
engine = create_async_engine(DATABASE_URL, echo=False)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI 依赖：为每个请求生成一个异步数据库会话，请求结束时自动关闭。"""
    async with async_session() as session:
        yield session