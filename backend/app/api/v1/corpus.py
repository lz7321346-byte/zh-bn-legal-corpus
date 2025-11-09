"""API endpoints for accessing the bilingual legal corpus."""
from __future__ import annotations

from typing import Optional

try:  # pragma: no cover - optional FastAPI dependency
    from fastapi import APIRouter, HTTPException, Query
except ModuleNotFoundError:  # pragma: no cover - fallback for tests
    class Query:  # type: ignore
        def __init__(self, default: object, **_: object) -> None:
            self.default = default

    class HTTPException(Exception):
        def __init__(self, status_code: int, detail: str) -> None:
            super().__init__(detail)
            self.status_code = status_code
            self.detail = detail

    class APIRouter:  # type: ignore
        def __init__(self, prefix: str = "", tags: list[str] | None = None) -> None:
            self.prefix = prefix
            self.tags = tags or []

        def get(self, path: str):  # pragma: no cover - no actual routing in tests
            def decorator(func):
                return func

            return decorator


from backend.app.models.corpus import Document, Paragraph
from backend.app.search.indexer import CorpusIndexer
from backend.app.services.alignment import AlignmentService

router = APIRouter(prefix="/corpus", tags=["corpus"])
indexer = CorpusIndexer()
alignment_service = AlignmentService()


@router.get("/")
def search_corpus(
    query: str = Query("", description="Full-text search query"),
    category: Optional[str] = Query(None, description="Filter by legal category"),
    year: Optional[int] = Query(None, description="Filter by publication year"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
) -> dict:
    return indexer.search(query=query, category=category, year=year, page=page, page_size=page_size)


@router.get("/{document_id}")
def get_document(document_id: str) -> dict:
    document = indexer.get_document(document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    alignments = alignment_service.get_alignments(document_id)
    return {
        "document": {
            "identifier": document.identifier,
            "title": document.title,
            "source_language": document.source_language,
            "target_language": document.target_language,
            "source": document.source,
            "publication_date": document.publication_date.isoformat() if document.publication_date else None,
            "official_url": document.official_url,
            "categories": document.categories,
        },
        "alignments": [
            {
                "identifier": alignment.identifier,
                "source_sentence": alignment.source_sentence,
                "target_sentence": alignment.target_sentence,
                "score": alignment.score,
            }
            for alignment in alignments
        ],
    }


@router.get("/{document_id}/export")
def export_document(document_id: str) -> dict:
    document_payload = get_document(document_id)
    return document_payload


def sync_document(
    document: Document,
    source_text: str,
    target_text: str,
    category: Optional[str] = None,
) -> None:
    if category and category not in document.categories:
        document.categories.append(category)
    alignment_result = alignment_service.align_and_store(document, source_text, target_text)
    paragraphs = []
    if source_text:
        paragraphs.append(
            Paragraph(
                identifier=document.identifier + "-src",
                document_id=document.identifier,
                order=1,
                language=document.source_language,
                text=source_text,
            )
        )
    if target_text:
        paragraphs.append(
            Paragraph(
                identifier=document.identifier + "-tgt",
                document_id=document.identifier,
                order=2,
                language=document.target_language,
                text=target_text,
            )
        )
    indexer.index_document(document, paragraphs, alignment_result.alignments)
