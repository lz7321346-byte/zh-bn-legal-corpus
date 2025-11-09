"""Domain models and storage for legal terms."""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, Literal

from pydantic import BaseModel, Field, field_validator


class Term(BaseModel):
    """Pydantic representation of a legal term entry."""

    zh: str = Field(..., description="Chinese term")
    bn: str = Field(..., description="Bengali term")
    en: str = Field(..., description="English translation")

    @field_validator("zh", "bn", "en", mode="before")
    @classmethod
    def _strip(cls, value: str) -> str:
        if isinstance(value, str):
            return value.strip()
        return value


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
        with self.storage_path.open("w", encoding="utf-8") as fp:
            json.dump(serialized, fp, ensure_ascii=False, indent=2)

    def merge_terms(self, new_terms: Iterable[Term]) -> TermMergeResult:
        """Merge new terms with the stored ones, avoiding duplicates."""

        existing_terms = self.load_terms()
        seen = {(term.zh, term.bn, term.en) for term in existing_terms}

        added = 0
        for term in new_terms:
            key = (term.zh, term.bn, term.en)
            if key in seen:
                continue
            existing_terms.append(term)
            seen.add(key)
            added += 1

        self.save_terms(existing_terms)
        return TermMergeResult(added=added, total=len(existing_terms))

    def search(self, query: str | None, scope: Literal["zh", "bn", "en"] | None = None) -> list[Term]:
        """Perform a case-insensitive substring search over the requested term fields."""

        all_terms = self.load_terms()
        if not query:
            return all_terms

        normalized = query.casefold()

        if scope is not None and scope not in {"zh", "bn", "en"}:
            raise ValueError("Invalid search scope provided")

        def fields_for(term: Term) -> list[str]:
            if scope is None:
                return [term.zh, term.bn, term.en]
            return [getattr(term, scope)]

        def matches(term: Term) -> bool:
            return any(normalized in field.casefold() for field in fields_for(term))

        return [term for term in all_terms if matches(term)]


__all__ = ["Term", "TermMergeResult", "TermsRepository"]
