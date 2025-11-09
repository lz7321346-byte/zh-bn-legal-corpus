import importlib.util
import json
import sys
from pathlib import Path

import pytest

MODULE_PATH = Path(__file__).resolve().parents[1] / "app" / "models" / "terms.py"
spec = importlib.util.spec_from_file_location("terms_module", MODULE_PATH)
terms_module = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = terms_module
assert spec.loader is not None
spec.loader.exec_module(terms_module)  # type: ignore[assignment]
Term = terms_module.Term
TermsRepository = terms_module.TermsRepository


def write_terms(path: Path, terms: list[Term]) -> None:
    serialized = [term.model_dump() for term in terms]
    path.write_text(json.dumps(serialized, ensure_ascii=False), encoding="utf-8")


def test_search_filters_by_scope(tmp_path: Path) -> None:
    storage_path = tmp_path / "terms.json"
    terms = [
        Term(zh="合同", bn="চুক্তি", en="contract"),
        Term(zh="法院", bn="আদালত", en="court"),
    ]
    write_terms(storage_path, terms)
    repository = TermsRepository(storage_path)

    zh_results = repository.search("合", scope="zh")
    assert [term.zh for term in zh_results] == ["合同"]

    en_results = repository.search("court", scope="en")
    assert [term.en for term in en_results] == ["court"]


def test_search_rejects_invalid_scope(tmp_path: Path) -> None:
    storage_path = tmp_path / "terms.json"
    write_terms(storage_path, [Term(zh="合同", bn="চুক্তি", en="contract")])
    repository = TermsRepository(storage_path)

    with pytest.raises(ValueError):
        repository.search("contract", scope="de")
