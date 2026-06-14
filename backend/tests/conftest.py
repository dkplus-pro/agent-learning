"""Pytest fixtures for backend tests."""

import asyncio
from collections.abc import AsyncGenerator

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel

import database as db_module
from main import app
from models import Conversation, Message  # noqa: F401

# In-memory SQLite for tests
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Create a fresh in-memory database for model tests."""
    engine = create_async_engine(
        TEST_DATABASE_URL, echo=False, connect_args={"check_same_thread": False}
    )
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

    factory = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with factory() as session:
        yield session

    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    """Create a test client with in-memory database."""
    import tempfile, os
    # Use file-based temp database to avoid aiosqlite :memory: quirks
    fd, db_path = tempfile.mkstemp(suffix='.db')
    os.close(fd)
    db_url = f"sqlite+aiosqlite:///{db_path}"

    try:
        engine = create_async_engine(
            db_url, echo=False, connect_args={"check_same_thread": False}
        )
        async with engine.begin() as conn:
            await conn.run_sync(SQLModel.metadata.create_all)

        factory = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

        async def _make_session() -> AsyncGenerator[AsyncSession, None]:
            async with factory() as s:
                yield s

        # Save originals
        orig_async = db_module.async_session
        orig_get = db_module.get_session

        # Replace database module functions
        db_module.async_session = factory
        db_module.get_session = _make_session

        # Override FastAPI dependency
        app.dependency_overrides[orig_get] = _make_session

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            yield ac

        # Restore
        db_module.async_session = orig_async
        db_module.get_session = orig_get
        app.dependency_overrides.clear()

        await engine.dispose()
    finally:
        os.unlink(db_path)
