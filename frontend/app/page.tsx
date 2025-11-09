"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from "react";

type Term = {
  zh: string;
  bn: string;
  en: string;
};

type Scope = "zh" | "bn" | "en" | "all";

const API_BASE = "http://127.0.0.1:8000/api/v1/terms";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Term[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [searchNotice, setSearchNotice] = useState<string | null>(null);
  const [scope, setScope] = useState<Scope>("all");
  const [resultCount, setResultCount] = useState(0);

  const placeholderByScope: Record<Scope, string> = {
    zh: "按中文关键词搜索",
    bn: "按孟加拉语关键词搜索",
    en: "按英文关键词搜索",
    all: "Search by Chinese, Bengali, or English keyword",
  };

  const performSearch = useCallback(
    async (override?: string) => {
      const searchTerm = override ?? query;
      setLoading(true);
      setError(null);
      setSearchNotice(null);
      try {
        const params = new URLSearchParams();
        if (searchTerm) {
          params.set("q", searchTerm);
        }
        if (scope !== "all") {
          params.set("scope", scope);
        }
        const queryString = params.toString();
        const url = queryString ? `${API_BASE}?${queryString}` : API_BASE;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Unable to search terms (status ${response.status})`);
        }
        const data: Term[] = await response.json();
        setResults(data);
        if (!data.length) {
          setSearchNotice("No terms matched your search yet.");
        }
      } catch (fetchError) {
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "The terminology service is currently unreachable."
        );
      } finally {
        setLoading(false);
      }
    },
    [query, scope]
  );

  useEffect(() => {
    void performSearch("");
  }, [performSearch]);

  useEffect(() => {
    setResultCount(results.length);
  }, [results]);

  const onSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setInfoMessage(null);
    await performSearch();
  };

  const onUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploading(true);
    setError(null);
    setSearchNotice(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const detail = payload?.detail;
        throw new Error(
          typeof detail === "string"
            ? detail
            : `Upload failed with status ${response.status}`
        );
      }

      const summary: { added: number; total: number } = await response.json();
      setInfoMessage(
        `Added ${summary.added} term${summary.added === 1 ? "" : "s"}. Repository now holds ${summary.total} entries.`
      );
      await performSearch();
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Could not import the provided file."
      );
    } finally {
      setUploading(false);
      // Reset the input so the same file can be uploaded twice if needed.
      event.target.value = "";
    }
  };

  return (
    <>
      <header className="navbar">
        <div>
          <div style={{ fontSize: "1.2rem", fontWeight: 600 }}>
            中孟法律术语库
          </div>
          <div style={{ fontSize: "0.85rem", opacity: 0.85 }}>
            Zh–Bn Legal Corpus
          </div>
        </div>
        <nav className="nav-links">
          <a href="#dictionary">Dictionary</a>
          <a href="#corpus">Corpus</a>
          <a href="#import">Data Import</a>
        </nav>
      </header>
      <main>
        <div className="layout">
          <div className="content-wrapper">
            <aside className="sidebar">
              <h2>Legal Translation Hub</h2>
              <p>
                Explore bilingual legal terminology curated for Chinese and
                Bengali practitioners. All terms are stored locally so that the
                glossary remains usable even when you&apos;re working offline.
              </p>
              <p className="subtle-text">
                Adjust the upload parsing or swap the JSON data store inside
                <code style={{ margin: "0 0.25rem", padding: "0 0.3rem" }}>
                  backend/app/api/terms.py
                </code>
                when you are ready to connect to a database.
              </p>
            </aside>
            <section className="main-content" id="dictionary">
              <h1 className="section-title">Search the terminology dictionary</h1>
              <form className="search-form" onSubmit={onSearch}>
                <input
                  aria-label="Search terms"
                  className="search-input"
                  placeholder={placeholderByScope[scope]}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
                <button className="primary-button" type="submit" disabled={loading}>
                  {loading ? "Searching…" : "Search"}
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

              <div className="upload-panel" id="import">
                <h2 style={{ marginTop: 0, fontSize: "1.1rem", color: "#1f2a44" }}>
                  Import new terms
                </h2>
                <p className="subtle-text">
                  Upload a .xlsx file with zh / bn / en columns or a .docx file
                  formatted as 中文｜孟加拉语｜英文.
                </p>
                <input
                  aria-label="Upload terms file"
                  type="file"
                  accept=".xlsx,.docx"
                  onChange={onUpload}
                  disabled={uploading}
                />
                {uploading && <div className="status-text">Uploading…</div>}
              </div>

              {error && <div className="status-text error-text">{error}</div>}
              {infoMessage && !error && (
                <div className="status-text">{infoMessage}</div>
              )}

              <div className="results-list">
                {loading && <div>Loading…</div>}
                {!loading && results.length === 0 && !error && (
                  <div className="empty-state">
                    {searchNotice ?? "Start by searching for a legal concept."}
                  </div>
                )}
                {!loading &&
                  results.map((term, index) => (
                    <article className="result-card" key={`${term.zh}-${term.bn}-${index}`}>
                      <div>
                        <div className="term-label">中文</div>
                        <p className="term-value">{term.zh}</p>
                      </div>
                      <div>
                        <div className="term-label">孟加拉语</div>
                        <p className="term-value">{term.bn}</p>
                      </div>
                      <div>
                        <div className="term-label">英文</div>
                        <p className="term-value">{term.en}</p>
                      </div>
                    </article>
                  ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
