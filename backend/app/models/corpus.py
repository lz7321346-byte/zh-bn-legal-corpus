"""Data models representing bilingual legal corpus entities."""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date
from typing import List, Optional


@dataclass(slots=True)
class Document:
    """Represents a bilingual legal document with metadata."""

    identifier: str
    title: str
    source_language: str
    target_language: str
    source: str
    publication_date: Optional[date] = None
    official_url: Optional[str] = None
    categories: List[str] = field(default_factory=list)


@dataclass(slots=True)
class Paragraph:
    """A single paragraph in one language from a document."""

    identifier: str
    document_id: str
    order: int
    language: str
    text: str


@dataclass(slots=True)
class SentenceAlignment:
    """Aligned sentence pair between two languages."""

    identifier: str
    document_id: str
    source_sentence: str
    target_sentence: str
    source_language: str
    target_language: str
    score: Optional[float] = None
    source_paragraph: Optional[int] = None
    target_paragraph: Optional[int] = None
