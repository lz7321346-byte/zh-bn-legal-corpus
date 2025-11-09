"""API router packages."""

from fastapi import APIRouter

from ..config import settings
from .terms import router as terms_router
from .v1 import health

api_router = APIRouter()
api_router.include_router(health.router, prefix=settings.api_v1_prefix)
api_router.include_router(terms_router, prefix=settings.api_v1_prefix)

__all__ = ["api_router"]
