from datetime import date

from backend.app.models.corpus import Document
from backend.app.services.alignment import AlignmentService


def test_alignment_pairs_sentences() -> None:
    service = AlignmentService()
    document = Document(
        identifier="doc-1",
        title="Test Act",
        source_language="bn",
        target_language="zh",
        source="gazette",
        publication_date=date(2020, 1, 1),
        official_url="https://example.com/doc-1",
    )
    source_text = "ধারা ১। এটি একটি পরীক্ষা বাক্য। ধারা ২।"
    target_text = "第一条。这是一个测试句子。第二条。"

    result = service.align_and_store(document, source_text, target_text)

    assert len(result.alignments) == 3
    assert result.alignments[0].source_sentence.startswith("ধারা ১")
    assert result.alignments[0].target_sentence.startswith("第一条")
