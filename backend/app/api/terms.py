"""API routes for interacting with legal terms."""

from __future__ import annotations

import os
import secrets
from pathlib import Path

from fastapi import APIRouter, Depends, Header, HTTPException, Query, status

from ..models.terms import Term, TermsRepository

router = APIRouter(prefix="/terms", tags=["terms"])

_DATA_PATH = Path(__file__).resolve().parents[2] / "data" / "terms.json"
_repository = TermsRepository(_DATA_PATH)


async def require_admin_token(x_admin_token: str = Header(..., alias="X-Admin-Token")) -> None:
    """Validate that the caller supplied the configured admin token."""

    expected = os.getenv("APP_ADMIN_TOKEN")
    if not expected:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Admin token is not configured on the server.",
        )

    if not secrets.compare_digest(x_admin_token, expected):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid administrator token.",
        )


@router.get("", response_model=list[Term], summary="Search terms")
async def search_terms(
    q: str | None = Query(default=None, description="Keyword to search for"),
) -> list[Term]:
    """Perform a fuzzy search over the stored terms."""

    try:
        normalized_query = q.strip() if q else None
        return _repository.search(normalized_query)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        ) from exc


@router.post(
    "/upload",
    summary="Bulk import terms",
    dependencies=[Depends(require_admin_token)],
)
async def upload_terms() -> dict[str, int]:
    """Placeholder endpoint indicating the bulk import workflow is locked down."""

    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Bulk import is temporarily unavailable for the enriched terminology format.",
    )


__all__ = ["router"]
