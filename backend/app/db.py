from __future__ import annotations

from contextlib import asynccontextmanager, contextmanager
from typing import AsyncGenerator, Generator

from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import Session, sessionmaker

from .config import settings


engine = create_async_engine(str(settings.database_url), future=True, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

sync_database_url = str(settings.sync_database_url or str(settings.database_url).replace("+asyncpg", ""))
sync_engine = create_engine(sync_database_url, future=True, echo=False)
sync_session_factory = sessionmaker(bind=sync_engine, expire_on_commit=False, class_=Session)


@asynccontextmanager
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    session = AsyncSessionLocal()
    try:
        yield session
    finally:
        await session.close()


@contextmanager
def get_sync_db() -> Generator[Session, None, None]:
    session = sync_session_factory()
    try:
        yield session
    finally:
        session.close()
