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
          setSearchNotice("暂未找到相关术语。No matching terms yet.");
        }
      } catch (fetchError) {
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "术语服务暂时不可用。The terminology service is unreachable."
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
        `已新增 ${summary.added} 条术语（共 ${summary.total} 条）。`
      );
      await performSearch();
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "文件导入失败。Could not import the provided file."
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="page-sections">
      <section className="card intro-card" id="about">
        <h1>中孟法律术语库 · Zh–Bn Legal Corpus</h1>
        <p>
          专为中孟法律从业者打造的离线术语参考库，覆盖诉讼、合同、合规等常见场景，帮助您在双语沟通中保持精准表达。
        </p>
        <p className="secondary-text">
          A focused, offline-first reference of Chinese and Bengali legal terms to support accurate bilingual practice across litigation, contracts, and compliance.
        </p>
      </section>

      <section className="card search-card" id="dictionary">
        <h2>术语检索 Search</h2>
        <p className="card-description">
          输入关键词，即时检索中文、孟加拉语与英文对照。支持模糊匹配，帮助您快速定位专业术语。
        </p>
        <form className="search-form" onSubmit={onSearch}>
          <input
            aria-label="搜索术语"
            className="search-input"
            placeholder="请输入中文、孟加拉语或英文关键词"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? "检索中…" : "搜索"}
          </button>
        </form>

        {error && <div className="status-text error-text">{error}</div>}
        {infoMessage && !error && (
          <div className="status-text info-text">{infoMessage}</div>
        )}
        {searchNotice && !loading && results.length === 0 && (
          <div className="status-text subtle-text">{searchNotice}</div>
        )}

        {loading && <div className="status-text subtle-text">检索中…</div>}

        {!loading && results.length > 0 && (
          <div className="results-wrapper">
            <table className="term-table" aria-label="术语列表">
              <thead>
                <tr>
                  <th scope="col">中文</th>
                  <th scope="col">孟加拉语</th>
                  <th scope="col">英文</th>
                </tr>
              </thead>
              <tbody>
                {results.map((term, index) => (
                  <tr key={`${term.zh}-${term.bn}-${index}`}>
                    <td>{term.zh}</td>
                    <td>{term.bn}</td>
                    <td>{term.en}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && results.length === 0 && !error && !searchNotice && (
          <div className="empty-state">请输入关键词开始检索。</div>
        )}
      </section>

      <section className="card upload-card" id="import">
        <h2>资料导入 Upload</h2>
        <p className="card-description">
          请上传包含「中文 / 孟加拉语 / 英文」三列的 .xlsx 表格，或按照「中文｜孟加拉语｜英文」段落格式编排的 .docx 文档。
        </p>
        <p className="secondary-text">
          上传后系统将自动校验并更新本地术语库，便于团队共享离线资料。
        </p>
        <label className="upload-label">
          <span>{uploading ? "正在上传…" : "选择文件"}</span>
          <input
            aria-label="上传术语文件"
            type="file"
            accept=".xlsx,.docx"
            onChange={onUpload}
            disabled={uploading}
          />
        </label>
      </section>
    </div>
  );
}
