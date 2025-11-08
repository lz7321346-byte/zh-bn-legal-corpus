"""Sentence alignment service for the bilingual corpus."""
from __future__ import annotations

import itertools
import math
import re
import uuid
from dataclasses import dataclass
from typing import Iterable, List, Sequence

from backend.app.models.corpus import Document, SentenceAlignment

_SENTENCE_SPLIT_RE = re.compile(r"(?<=[。！？.!?])\s+")


@dataclass
class AlignmentResult:
    document: Document
    alignments: List[SentenceAlignment]


class SentenceSplitter:
    """Utility for splitting paragraphs into sentences."""

    def split(self, text: str) -> List[str]:
        if not text:
            return []
        sentences: List[str] = []
        start = 0
        for match in re.finditer(r"[。！？.!?]", text):
            end = match.end()
            sentences.append(text[start:end].strip())
            start = end
        if start < len(text):
            sentences.append(text[start:].strip())
        return [s for s in sentences if s]


class SimpleAlignmentEngine:
    """A naive alignment algorithm based on sentence order."""

    def align(self, source_sentences: Sequence[str], target_sentences: Sequence[str]) -> List[tuple[str, str, float]]:
        pairs: List[tuple[str, str, float]] = []
        total = max(len(source_sentences), len(target_sentences)) or 1
        for index, (src, tgt) in enumerate(itertools.zip_longest(source_sentences, target_sentences, fillvalue="")):
            if not src and not tgt:
                continue
            score = 1.0 - (index / total)
            pairs.append((src, tgt, score))
        return pairs


class AlignmentRepository:
    """In-memory persistence for alignments."""

    def __init__(self) -> None:
        self._storage: dict[str, List[SentenceAlignment]] = {}

    def save(self, document_id: str, alignments: Iterable[SentenceAlignment]) -> List[SentenceAlignment]:
        self._storage[document_id] = list(alignments)
        return self._storage[document_id]

    def get(self, document_id: str) -> List[SentenceAlignment]:
        return list(self._storage.get(document_id, []))


class AlignmentService:
    """Service orchestrating sentence alignment and persistence."""

    def __init__(self, repository: AlignmentRepository | None = None) -> None:
        self.splitter = SentenceSplitter()
        self.engine = SimpleAlignmentEngine()
        self.repository = repository or AlignmentRepository()

    def align_and_store(self, document: Document, source_text: str, target_text: str) -> AlignmentResult:
        source_sentences = self.splitter.split(source_text)
        target_sentences = self.splitter.split(target_text)
        pairs = self.engine.align(source_sentences, target_sentences)
        alignments = [
            SentenceAlignment(
                identifier=str(uuid.uuid4()),
                document_id=document.identifier,
                source_sentence=src,
                target_sentence=tgt,
                source_language=document.source_language,
                target_language=document.target_language,
                score=score,
            )
            for src, tgt, score in pairs
        ]
        stored = self.repository.save(document.identifier, alignments)
        return AlignmentResult(document=document, alignments=stored)

    def get_alignments(self, document_id: str) -> List[SentenceAlignment]:
        return self.repository.get(document_id)
