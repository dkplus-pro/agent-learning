"""Database connection and session management."""

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from config import settings
from models import Conversation, Message  # noqa: F401 - ensure models registered

# Use aiosqlite for async SQLite support
DATABASE_URL = settings.database_url.replace("sqlite:///", "sqlite+aiosqlite:///")

engine = create_async_engine(DATABASE_URL, echo=False)

async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """Dependency: yield an async database session."""
    async with async_session() as session:
        yield session
