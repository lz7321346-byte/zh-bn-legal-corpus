"use client";

import { useEffect, useMemo, useState } from "react";

type SearchItem = {
  document_id: string;
  title: string;
  language_pair: string;
  paragraph_id: string | null;
  alignment_id: string | null;
  text: string | null;
  source_sentence: string | null;
  target_sentence: string | null;
  score: number;
  official_url: string | null;
  publication_date: string | null;
};

type SearchResponse = {
  total: number;
  page: number;
  page_size: number;
  items: SearchItem[];
};

const initialResponse: SearchResponse = {
  total: 0,
  page: 1,
  page_size: 10,
  items: [],
};

export default function CorpusBrowserPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [year, setYear] = useState("");
  const [response, setResponse] = useState<SearchResponse>(initialResponse);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set("query", query);
    if (category) params.set("category", category);
    if (year) params.set("year", year);
    params.set("page", response.page.toString());
    params.set("page_size", response.page_size.toString());
    return `/api/corpus?${params.toString()}`;
  }, [query, category, year, response.page, response.page_size]);

  useEffect(() => {
    const controller = new AbortController();
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(apiUrl, { signal: controller.signal });
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }
        const json: SearchResponse = await res.json();
        setResponse(json);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError((err as Error).message);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    return () => controller.abort();
  }, [apiUrl]);

  return (
    <div className="space-y-6 p-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">平行法规语料库</h1>
        <p className="text-sm text-gray-600">
          浏览孟加拉语-中文等语种的法规条文，对齐结果以及原文链接。
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        <label className="flex flex-col">
          <span className="text-sm font-medium">全文检索</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="请输入关键词"
            className="rounded border px-3 py-2"
          />
        </label>
        <label className="flex flex-col">
          <span className="text-sm font-medium">法律门类</span>
          <input
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            placeholder="如 tax"
            className="rounded border px-3 py-2"
          />
        </label>
        <label className="flex flex-col">
          <span className="text-sm font-medium">年份</span>
          <input
            value={year}
            onChange={(event) => setYear(event.target.value)}
            placeholder="如 2021"
            className="rounded border px-3 py-2"
          />
        </label>
      </section>

      {loading && <p>正在加载...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <section className="space-y-4">
        {response.items.map((item) => (
          <article key={`${item.document_id}-${item.alignment_id ?? item.paragraph_id}`} className="rounded border p-4">
            <header className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">{item.title}</h2>
                <p className="text-xs text-gray-500">
                  {item.language_pair} · {item.publication_date ?? "未知时间"}
                </p>
              </div>
              {item.official_url && (
                <a
                  href={item.official_url}
                  className="text-sm text-blue-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  原文链接
                </a>
              )}
            </header>

            {item.text && (
              <p className="mt-3 whitespace-pre-line text-sm">{item.text}</p>
            )}

            {(item.source_sentence || item.target_sentence) && (
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                <div>
                  <h3 className="text-xs font-semibold uppercase text-gray-500">源语言</h3>
                  <p className="whitespace-pre-line text-sm">{item.source_sentence}</p>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase text-gray-500">目标语言</h3>
                  <p className="whitespace-pre-line text-sm">{item.target_sentence}</p>
                </div>
              </div>
            )}
          </article>
        ))}

        {response.items.length === 0 && !loading && <p>暂无结果。</p>}
      </section>
    </div>
  );
}
