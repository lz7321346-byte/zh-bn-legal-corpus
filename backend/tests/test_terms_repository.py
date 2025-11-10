import importlib.util
import json
import sys
from pathlib import Path

MODULE_PATH = Path(__file__).resolve().parents[1] / "app" / "models" / "terms.py"
spec = importlib.util.spec_from_file_location("terms_module", MODULE_PATH)
terms_module = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = terms_module
assert spec.loader is not None
spec.loader.exec_module(terms_module)  # type: ignore[assignment]
Term = terms_module.Term
TermContext = terms_module.TermContext
TermDefinition = terms_module.TermDefinition
TermUsage = terms_module.TermUsage
TermsRepository = terms_module.TermsRepository


def write_terms(path: Path, terms: list[Term]) -> None:
    serialized = [term.model_dump() for term in terms]
    path.write_text(json.dumps(serialized, ensure_ascii=False), encoding="utf-8")


def build_term(
    headword: str,
    zh_definition: str,
    en_definition: str,
    bn_definition: str,
    usages: list[dict[str, str]],
) -> Term:
    return Term(
        headword=headword,
        definitions=TermDefinition(zh=zh_definition, en=en_definition, bn=bn_definition),
        usages=[
            TermUsage(
                chinese=usage["chinese"],
                english=usage["english"],
                bengali=usage["bengali"],
                contexts=TermContext(
                    zh=usage.get("context_zh"),
                    en=usage.get("context_en"),
                    bn=usage.get("context_bn"),
                ),
                explanation=usage.get("explanation"),
            )
            for usage in usages
        ],
    )


def test_search_matches_headword_and_usage(tmp_path: Path) -> None:
    storage_path = tmp_path / "terms.json"
    terms = [
        build_term(
            "合同",
            "对当事人约定权利义务的协议",
            "Agreement defining rights and obligations",
            "পক্ষদের অধিকার ও দায়িত্ব নির্ধারণকারী চুক্তি",
            [
                {
                    "chinese": "劳动合同",
                    "english": "employment contract",
                    "bengali": "চাকরির চুক্তি",
                    "context_zh": "订立劳动合同应当遵循平等自愿原则",
                }
            ],
        ),
        build_term(
            "法院",
            "行使审判权的国家机关",
            "State organ that exercises judicial authority",
            "বিচারিক ক্ষমতা প্রয়োগকারী রাষ্ট্রীয় সংস্থা",
            [
                {
                    "chinese": "人民法院",
                    "english": "people's court",
                    "bengali": "জনগণের আদালত",
                    "context_en": "The people's courts exercise adjudicatory power.",
                }
            ],
        ),
    ]
    write_terms(storage_path, terms)
    repository = TermsRepository(storage_path)

    zh_results = repository.search("合同")
    assert [term.headword for term in zh_results] == ["合同"]

    usage_results = repository.search("people's court")
    assert [term.headword for term in usage_results] == ["法院"]


def test_search_handles_missing_query(tmp_path: Path) -> None:
    storage_path = tmp_path / "terms.json"
    terms = [
        build_term(
            "行政许可",
            "行政机关准予从事特定活动的行为",
            "Administrative act approving a regulated activity",
            "প্রশাসনিক সংস্থার অনুমোদিত কার্যক্রম",
            [
                {
                    "chinese": "行政许可法",
                    "english": "Administrative Licensing Law",
                    "bengali": "প্রশাসনিক লাইসেন্স আইন",
                }
            ],
        )
    ]
    write_terms(storage_path, terms)
    repository = TermsRepository(storage_path)

    assert repository.search(None) == terms
