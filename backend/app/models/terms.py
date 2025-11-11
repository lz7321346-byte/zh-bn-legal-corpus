"""Domain models and storage helpers for enriched legal terms."""

from __future__ import annotations

import json
import os
import tempfile
from contextlib import suppress
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

from pydantic import BaseModel, Field, field_validator


def _strip_text(value: str | None) -> str | None:
    if isinstance(value, str):
        return value.strip()
    return value


class TermDefinition(BaseModel):
    """Tri-lingual definition text for a headword."""

    zh: str = Field(..., description="Chinese definition")
    en: str = Field(..., description="English definition")
    bn: str = Field(..., description="Bengali definition")

    @field_validator("zh", "en", "bn", mode="before")
    @classmethod
    def _strip(cls, value: str) -> str:
        stripped = _strip_text(value)
        if stripped is None:
            raise ValueError("Definition text cannot be empty")
        return stripped


class TermContext(BaseModel):
    """Contextual sentences for each supported language."""

    zh: str | None = Field(default=None, description="Chinese context")
    en: str | None = Field(default=None, description="English context")
    bn: str | None = Field(default=None, description="Bengali context")

    @field_validator("zh", "en", "bn", mode="before")
    @classmethod
    def _strip(cls, value: str | None) -> str | None:
        return _strip_text(value)


class TermUsage(BaseModel):
    """Contextualised usage of a headword mapped to source metadata."""

    chinese: str = Field(..., description="Chinese expression containing the headword")
    english: str = Field(..., description="English rendering of the expression")
    bengali: str = Field(..., description="Bengali rendering of the expression")
    contexts: TermContext = Field(
        default_factory=TermContext, description="Contextual sentences for the expression"
    )
    explanation: str | None = Field(
        default=None, description="Additional explanation for this specific usage"
    )
    source: str | None = Field(default=None, description="Source document for the usage")
    article: str | None = Field(default=None, description="Article or clause reference")

    @field_validator("chinese", "english", "bengali", "explanation", "source", "article", mode="before")
    @classmethod
    def _strip(cls, value: str | None) -> str | None:
        return _strip_text(value)


class Term(BaseModel):
    """Structured legal terminology entry with multilingual context."""

    headword: str = Field(..., description="Canonical Chinese headword")
    definitions: TermDefinition = Field(..., description="Definitions in three languages")
    usages: list[TermUsage] = Field(default_factory=list, description="Usage examples")

    @field_validator("headword", mode="before")
    @classmethod
    def _strip(cls, value: str) -> str:
        stripped = _strip_text(value)
        if not stripped:
            raise ValueError("Headword cannot be empty")
        return stripped


@dataclass
class TermMergeResult:
    """Result information when merging new terms into storage."""

    added: int
    total: int


class TermsRepository:
    """JSON-backed persistence layer for legal terms."""

    def __init__(self, storage_path: Path) -> None:
        self.storage_path = storage_path
        self.storage_path.parent.mkdir(parents=True, exist_ok=True)

    def load_terms(self) -> list[Term]:
        """Load all terms from the JSON storage, returning an empty list if missing."""

        if not self.storage_path.exists():
            return []

        try:
            with self.storage_path.open("r", encoding="utf-8") as fp:
                data = json.load(fp)
        except json.JSONDecodeError as exc:  # pragma: no cover - defensive
            raise ValueError("Stored terms file is not valid JSON") from exc

        return [Term.model_validate(item) for item in data]

    def save_terms(self, terms: Iterable[Term]) -> None:
        """Persist the provided terms back to storage."""

        serialized = [term.model_dump() for term in terms]
        temp_path: Path | None = None

        try:
            with tempfile.NamedTemporaryFile(
                "w", encoding="utf-8", dir=self.storage_path.parent, delete=False
            ) as temp_file:
                temp_path = Path(temp_file.name)
                json.dump(serialized, temp_file, ensure_ascii=False, indent=2)
                temp_file.flush()
                os.fsync(temp_file.fileno())

            assert temp_path is not None
            temp_path.replace(self.storage_path)
        except Exception:
            if temp_path is not None:
                with suppress(OSError):
                    temp_path.unlink(missing_ok=True)
            raise

    def merge_terms(self, new_terms: Iterable[Term]) -> TermMergeResult:
        """Merge new terms with the stored ones, avoiding duplicates."""

        existing_terms = self.load_terms()
        seen = {term.headword for term in existing_terms}

        added = 0
        for term in new_terms:
            key = term.headword
            if key in seen:
                continue
            existing_terms.append(term)
            seen.add(key)
            added += 1

        self.save_terms(existing_terms)
        return TermMergeResult(added=added, total=len(existing_terms))

    def search(self, query: str | None) -> list[Term]:
        """Perform a case-insensitive substring search across headword, definitions and usages."""

        all_terms = self.load_terms()
        if not query:
            return all_terms

        normalized = query.casefold()

        def iter_fields(term: Term) -> Iterable[str]:
            yield term.headword
            yield term.definitions.zh
            yield term.definitions.en
            yield term.definitions.bn
            for usage in term.usages:
                yield usage.chinese
                yield usage.english
                yield usage.bengali
                if usage.explanation:
                    yield usage.explanation
                if usage.source:
                    yield usage.source
                if usage.article:
                    yield usage.article
                if usage.contexts.zh:
                    yield usage.contexts.zh
                if usage.contexts.en:
                    yield usage.contexts.en
                if usage.contexts.bn:
                    yield usage.contexts.bn

        def matches(term: Term) -> bool:
            return any(normalized in field.casefold() for field in iter_fields(term))

        return [term for term in all_terms if matches(term)]


__all__ = [
    "Term",
    "TermDefinition",
    "TermContext",
    "TermUsage",
    "TermMergeResult",
    "TermsRepository",
]
