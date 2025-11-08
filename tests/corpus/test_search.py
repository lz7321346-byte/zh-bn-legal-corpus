from datetime import date

from backend.app.api.v1.corpus import indexer, sync_document
from backend.app.models.corpus import Document


def setup_document() -> Document:
    document = Document(
        identifier="doc-2",
        title="Customs Regulation",
        source_language="bn",
        target_language="zh",
        source="parliament",
        publication_date=date(2021, 5, 20),
        official_url="https://example.com/doc-2",
        categories=["tax"],
    )
    sync_document(
        document,
        source_text="ধারা ১। কাস্টমস শুল্ক নির্ধারণ।",
        target_text="第一条。海关税的确定。",
        category="tax",
    )
    return document


def test_search_returns_results() -> None:
    document = setup_document()
    results = indexer.search("海关", category="tax", year=2021, page=1, page_size=5)
    assert results["total"] >= 1
    assert any(item["document_id"] == document.identifier for item in results["items"])


def test_pagination_limits_results() -> None:
    document = setup_document()
    results = indexer.search("ধারা", page=1, page_size=1)
    assert results["page"] == 1
    assert results["page_size"] == 1
    assert len(results["items"]) == 1
