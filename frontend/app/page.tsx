"use client";

import { FormEvent, useState } from "react";

type Term = {
  zh: string;
  bn: string;
  en: string;
};

type Scope = "all" | "zh" | "bn" | "en";

const placeholders: Record<Scope, string> = {
  all: "按中文、孟加拉语或英文关键词搜索",
  zh: "按中文关键词搜索",
  bn: "按孟加拉语关键词搜索",
  en: "按英文关键词搜索",
};

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<Scope>("all");
  const [results, setResults] = useState<Term[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    setHasSearched(true);

    try {
      const params = new URLSearchParams();
      const trimmedQuery = query.trim();

      if (trimmedQuery) {
        params.set("q", trimmedQuery);
      }

      if (scope !== "all") {
        params.set("scope", scope);
      }

      const queryString = params.toString();
      const response = await fetch(
        queryString ? `/api/v1/terms?${queryString}` : "/api/v1/terms"
      );

      if (!response.ok) {
        throw new Error("Unable to load terms");
      }

      const data: Term[] = await response.json();
      setResults(data);
    } catch (fetchError) {
      console.error(fetchError);
      setResults([]);
      setError("术语查询服务暂时不可用，请稍后再试。");
    } finally {
      setLoading(false);
    }
  };

  const resultCount = results.length;

  return (
    <>
      <header className="site-header">
        <div>
          <div style={{ fontSize: "1.2rem", fontWeight: 600 }}>
            中国法律翻译术语库
          </div>
          <div style={{ fontSize: "0.85rem", opacity: 0.85 }}>
            中孟双语 · 在线词典
          </div>
        </div>
        <nav className="site-nav">
          <a href="#dictionary">Dictionary</a>
          <a href="#corpus">Corpus</a>
          <a href="#about">About</a>
        </nav>
      </header>

      <main>
        <div className="hero">
          <aside className="sidebar">
            <h2>Legal Translation Hub</h2>
            <p>
              Explore bilingual legal terminology curated for Chinese and
              Bengali practitioners. All terms are served directly from the
              中孟法律翻译后台接口 so you can search the glossary instantly.
            </p>
            <p className="subtle-text">
              When you are ready to expand, connect the API in
              <code style={{ margin: "0 0.25rem", padding: "0 0.3rem" }}>
                backend/app/api/terms.py
              </code>
              to your preferred database or terminology store.
            </p>
          </aside>

          <section className="main-content" id="dictionary">
            <h1 className="section-title">搜索中孟法律翻译术语</h1>

            <form className="search-form" onSubmit={handleSearch}>
              <input
                aria-label="搜索术语"
                className="search-input"
                placeholder={placeholders[scope]}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <button className="primary-button" type="submit" disabled={loading}>
                {loading ? "搜索中…" : "搜索"}
              </button>
            </form>

            <div className="filter-bar">
              <label className="filter-label" htmlFor="language-scope">
                语言范围
              </label>
              <select
                id="language-scope"
                className="scope-select"
                value={scope}
                onChange={(event) => setScope(event.target.value as Scope)}
                aria-label="选择语言范围"
              >
                <option value="zh">按中文</option>
                <option value="bn">按孟加拉语</option>
                <option value="en">按英文</option>
                <option value="all">全部</option>
              </select>
              <span className="result-count">共 {resultCount} 条结果</span>
            </div>

            {loading && <div className="status-text">搜索中…</div>}

            {error && <div className="status-text error-text">{error}</div>}

            {!loading && !error && hasSearched && resultCount === 0 && (
              <div className="empty-state">暂无匹配的术语</div>
            )}

            {!loading && !error && resultCount > 0 && (
              <div className="results-table">
                {results.map((term, index) => (
                  <article
                    className="result-card"
                    key={`${term.zh}-${term.bn}-${term.en}-${index}`}
                  >
                    <div>
                      <div className="term-label">中文</div>
                      <p className="term-value">{term.zh || "—"}</p>
                    </div>
                    <div>
                      <div className="term-label">孟加拉语</div>
                      <p className="term-value">{term.bn || "—"}</p>
                    </div>
                    <div>
                      <div className="term-label">英文</div>
                      <p className="term-value">{term.en || "—"}</p>
                    </div>
                  </article>
                ))}
              </div>
            )}

            <div className="import-panel" id="corpus">
              <h2 style={{ marginTop: 0, fontSize: "1.1rem", color: "#1f2a44" }}>
                Corpus integration
              </h2>
              <p className="subtle-text">
                Pair the terminology dictionary with bilingual legislation and
                case-law corpora to provide richer context for each term.
              </p>
            </div>

            <div className="upload-panel" id="about">
              <h2 style={{ marginTop: 0, fontSize: "1.1rem", color: "#1f2a44" }}>
                About the project
              </h2>
              <p className="subtle-text">
                该原型展示了如何用 Next.js + FastAPI 构建中国与孟加拉国法律翻译
                工具。继续扩展即可支持更丰富的术语分类、例句与语料联动。
              </p>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
