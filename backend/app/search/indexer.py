"""Simplified Elasticsearch-like indexer for the legal corpus."""
from __future__ import annotations

import itertools
from dataclasses import dataclass, field
from typing import Dict, Iterable, List, Optional

from backend.app.models.corpus import Document, Paragraph, SentenceAlignment


@dataclass
class SearchHit:
    document: Document
    paragraph: Optional[Paragraph]
    alignment: Optional[SentenceAlignment]
    score: float


@dataclass
class CorpusIndex:
    name: str
    mappings: Dict[str, str]
    settings: Dict[str, str] = field(default_factory=dict)


class CorpusIndexer:
    """In-memory search index with an Elasticsearch-like interface."""

    def __init__(self) -> None:
        self.index = CorpusIndex(
            name="corpus",
            mappings={
                "document_id": "keyword",
                "language": "keyword",
                "category": "keyword",
                "text": "text",
                "year": "integer",
            },
            settings={"analysis": "standard"},
        )
        self._documents: Dict[str, Document] = {}
        self._paragraphs: Dict[str, List[Paragraph]] = {}
        self._alignments: Dict[str, List[SentenceAlignment]] = {}

    def index_document(
        self,
        document: Document,
        paragraphs: Iterable[Paragraph],
        alignments: Iterable[SentenceAlignment],
    ) -> None:
        self._documents[document.identifier] = document
        self._paragraphs[document.identifier] = list(paragraphs)
        self._alignments[document.identifier] = list(alignments)

    def search(
        self,
        query: str,
        *,
        category: Optional[str] = None,
        year: Optional[int] = None,
        page: int = 1,
        page_size: int = 10,
    ) -> dict:
        hits: List[SearchHit] = []
        query_lower = query.lower()
        for document_id, document in self._documents.items():
            if category and category not in document.categories:
                continue
            if year and document.publication_date and document.publication_date.year != year:
                continue
            paragraphs = self._paragraphs.get(document_id, [])
            alignments = self._alignments.get(document_id, [])
            for paragraph in paragraphs:
                text = paragraph.text.lower()
                if query_lower in text:
                    hits.append(
                        SearchHit(
                            document=document,
                            paragraph=paragraph,
                            alignment=None,
                            score=text.count(query_lower),
                        )
                    )
            for alignment in alignments:
                text = f"{alignment.source_sentence} {alignment.target_sentence}".lower()
                if query_lower in text:
                    hits.append(
                        SearchHit(
                            document=document,
                            paragraph=None,
                            alignment=alignment,
                            score=text.count(query_lower) + 0.5,
                        )
                    )
        hits.sort(key=lambda hit: hit.score, reverse=True)
        total = len(hits)
        start = (page - 1) * page_size
        end = start + page_size
        paginated = hits[start:end]
        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "items": [
                {
                    "document_id": hit.document.identifier,
                    "title": hit.document.title,
                    "language_pair": f"{hit.document.source_language}-{hit.document.target_language}",
                    "paragraph_id": hit.paragraph.identifier if hit.paragraph else None,
                    "alignment_id": hit.alignment.identifier if hit.alignment else None,
                    "text": hit.paragraph.text if hit.paragraph else None,
                    "source_sentence": hit.alignment.source_sentence if hit.alignment else None,
                    "target_sentence": hit.alignment.target_sentence if hit.alignment else None,
                    "score": hit.score,
                    "official_url": hit.document.official_url,
                    "publication_date": hit.document.publication_date.isoformat() if hit.document.publication_date else None,
                }
                for hit in paginated
            ],
        }

    def get_document(self, document_id: str) -> Optional[Document]:
        return self._documents.get(document_id)

    def get_alignments(self, document_id: str) -> List[SentenceAlignment]:
        return list(self._alignments.get(document_id, []))
