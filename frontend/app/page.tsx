"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from "react";

type Term = {
  zh: string;
  bn: string;
  en: string;
};

const API_BASE = "http://127.0.0.1:8000/api/v1/terms";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Term[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [searchNotice, setSearchNotice] = useState<string | null>(null);

  const performSearch = useCallback(
    async (override?: string) => {
      const searchTerm = override ?? query;
      setLoading(true);
      setError(null);
      setSearchNotice(null);
      try {
        const url = searchTerm
          ? `${API_BASE}?q=${encodeURIComponent(searchTerm)}`
          : API_BASE;
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
    [query]
  );

  useEffect(() => {
    void performSearch("");
  }, [performSearch]);

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
      <header className="site-header">
        <div className="site-title">
          <div className="title-primary">中孟法律术语库</div>
          <div className="title-secondary">Zh–Bn Legal Corpus</div>
        </div>
        <nav className="nav-links">
          <a href="#dictionary">Dictionary</a>
          <a href="#corpus">Corpus</a>
          <a href="#import">Data Import</a>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <h1>Legal Translation Hub</h1>
          <p>
            Explore bilingual legal terminology curated for Chinese and Bengali
            practitioners. All terms are stored locally so that the glossary
            remains usable even when you&apos;re working offline.
          </p>
        </div>
        <form className="hero-search" onSubmit={onSearch}>
          <input
            aria-label="Search terms"
            className="hero-search-input"
            placeholder="Search by Chinese, Bengali, or English keyword"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? "Searching…" : "Search"}
          </button>
        </form>
      </section>

      <section className="filter-bar">
        <form className="filter-form" onSubmit={onSearch}>
          <input
            aria-label="Search terms"
            className="filter-search-input"
            placeholder="Refine terms by keyword"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button className="filter-submit" type="submit" disabled={loading}>
            {loading ? "Searching…" : "Search"}
          </button>
          <div className="language-selector-hook" aria-hidden>
            Language selector
          </div>
        </form>
      </section>

      <main className="content-shell">
        <div className="content-grid">
          <section className="results-panel" id="dictionary">
            <h2 className="section-title">Terminology results</h2>
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
          <aside className="auxiliary-panel" id="import">
            <h2 style={{ marginTop: 0, fontSize: "1.1rem", color: "#1f2a44" }}>
              Import new terms
            </h2>
            <p className="subtle-text">
              Upload a .xlsx file with zh / bn / en columns or a .docx file
              formatted as 中文｜孟加拉语｜英文.
            </p>
            <p className="subtle-text">
              Adjust the upload parsing or connect to a database inside
              <code style={{ margin: "0 0.25rem", padding: "0 0.3rem" }}>
                backend/app/api/terms.py
              </code>
              when you&apos;re ready to extend the data source.
            </p>
            <input
              aria-label="Upload terms file"
              type="file"
              accept=".xlsx,.docx"
              onChange={onUpload}
              disabled={uploading}
            />
            {uploading && <div className="status-text">Uploading…</div>}
          </aside>
        </div>
      </main>
    </>
  );
}
