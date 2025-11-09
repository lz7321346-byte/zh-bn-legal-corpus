"""Management command to bulk load bilingual legal corpus data."""
from __future__ import annotations

import argparse
import json
from datetime import datetime
from pathlib import Path
from typing import Any, Iterable

from backend.app.api.v1.corpus import sync_document
from backend.app.models.corpus import Document


def parse_args(argv: Iterable[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Load bilingual legal corpus from JSON file")
    parser.add_argument("path", type=Path, help="Path to JSON file containing documents")
    return parser.parse_args(argv)


def load_documents(path: Path) -> list[Document]:
    data = json.loads(path.read_text(encoding="utf-8"))
    documents: list[Document] = []
    for entry in data:
        publication_date = None
        if entry.get("publication_date"):
            publication_date = datetime.fromisoformat(entry["publication_date"]).date()
        document = Document(
            identifier=entry["identifier"],
            title=entry["title"],
            source_language=entry["source_language"],
            target_language=entry["target_language"],
            source=entry.get("source", "unknown"),
            publication_date=publication_date,
            official_url=entry.get("official_url"),
            categories=entry.get("categories", []),
        )
        documents.append(document)
    return documents


def main(argv: Iterable[str] | None = None) -> None:
    args = parse_args(argv)
    entries = json.loads(args.path.read_text(encoding="utf-8"))
    documents = load_documents(args.path)
    for entry, document in zip(entries, documents):
        sync_document(
            document,
            source_text=entry.get("source_text", ""),
            target_text=entry.get("target_text", ""),
            category=entry.get("category"),
        )


if __name__ == "__main__":
    main()
