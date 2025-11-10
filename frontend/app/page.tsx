"use client";

import { FormEvent, useState } from "react";

type TermUsage = {
  chinese: string;
  english: string;
  bengali: string;
  contexts: {
    zh?: string | null;
    en?: string | null;
    bn?: string | null;
  };
  explanation?: string | null;
  source?: string | null;
  article?: string | null;
};

type Term = {
  headword: string;
  definitions: {
    zh: string;
    en: string;
    bn: string;
  };
  usages: TermUsage[];
};

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Term[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const placeholder = "按中文或孟加拉语关键词搜索术语";

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    setHasSearched(true);

    try {
      const trimmedQuery = query.trim();
      const params = new URLSearchParams();

      if (trimmedQuery) {
        params.set("q", trimmedQuery);
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
            中孟法律术语 · 在线词典
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
                placeholder={placeholder}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <button className="primary-button" type="submit" disabled={loading}>
                {loading ? "搜索中…" : "搜索"}
              </button>
            </form>

            <div className="result-summary">共 {resultCount} 条结果</div>

            {loading && <div className="status-text">搜索中…</div>}

            {error && <div className="status-text error-text">{error}</div>}

            {!loading && !error && hasSearched && resultCount === 0 && (
              <div className="empty-state">暂无匹配的术语</div>
            )}

            {!loading && !error && resultCount > 0 && (
              <div className="results-table">
                {results.map((term) => (
                  <article className="dictionary-card" key={term.headword}>
                    <header className="dictionary-card__header">
                      <div>
                        <h2 className="dictionary-card__title">{term.headword}</h2>
                        <p className="dictionary-card__subtitle">
                          中孟术语词条 · Multilingual Legal Term Entry
                        </p>
                      </div>
                    </header>

                    <section className="definition-grid">
                      <div className="definition-block">
                        <span className="term-label">中文释义</span>
                        <p className="term-value">{term.definitions.zh}</p>
                      </div>
                      <div className="definition-block">
                        <span className="term-label">英文释义</span>
                        <p className="term-value">{term.definitions.en}</p>
                      </div>
                      <div className="definition-block">
                        <span className="term-label">孟加拉语释义</span>
                        <p className="term-value">{term.definitions.bn}</p>
                      </div>
                    </section>

                    <div className="usage-list">
                      {term.usages.map((usage, index) => (
                        <section
                          className="usage-card"
                          key={`${term.headword}-${usage.chinese}-${index}`}
                        >
                          <div className="usage-languages">
                            <div>
                              <span className="term-label">中文</span>
                              <p className="term-value">{usage.chinese || "—"}</p>
                            </div>
                            <div>
                              <span className="term-label">英文</span>
                              <p className="term-value">{usage.english || "—"}</p>
                            </div>
                            <div>
                              <span className="term-label">孟加拉语</span>
                              <p className="term-value">{usage.bengali || "—"}</p>
                            </div>
                          </div>

                          <div className="context-section">
                            <div>
                              <span className="context-label">中文上下文</span>
                              <p className="context-value">
                                {usage.contexts.zh || "暂无"}
                              </p>
                            </div>
                            <div>
                              <span className="context-label">英文上下文</span>
                              <p className="context-value">
                                {usage.contexts.en || "暂无"}
                              </p>
                            </div>
                            <div>
                              <span className="context-label">孟加拉语上下文</span>
                              <p className="context-value">
                                {usage.contexts.bn || "暂无"}
                              </p>
                            </div>
                          </div>

                          {usage.explanation && (
                            <div className="explanation-block">
                              <span className="context-label">解释</span>
                              <p className="context-value">{usage.explanation}</p>
                            </div>
                          )}

                          {(usage.source || usage.article) && (
                            <footer className="metadata-row">
                              {usage.source && (
                                <span className="metadata-item">
                                  来源信息：{usage.source}
                                </span>
                              )}
                              {usage.article && (
                                <span className="metadata-item">
                                  条目：{usage.article}
                                </span>
                              )}
                            </footer>
                          )}
                        </section>
                      ))}
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
