"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";

import type { SearchResultItem } from "@/lib/data/user-data/index";

const detailPaths: Record<string, string> = {
  tasks: "/records/task",
  schedules: "/records/schedule",
  habits: "/checklist/habits",
  events: "/records/event",
  ideas: "/records/idea",
  anniversaries: "/life/anniversary",
  gifts: "/life/gift",
};

export function SearchOverlay() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    }
    function onOpenSearch() {
      setOpen(true);
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("open-search", onOpenSearch);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("open-search", onOpenSearch);
    };
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      setResults(data.results ?? []);
    } catch {
      setResults([]);
    }
    setLoading(false);
  }, []);

  function onInput(value: string) {
    setQuery(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => doSearch(value), 250);
  }

  function close() {
    setOpen(false);
    setQuery("");
    setResults([]);
  }

  return (
    <>
      <button
        type="button"
        className="search-trigger"
        onClick={() => setOpen(true)}
        aria-label="搜索 (Ctrl+K)"
      >
        <Search aria-hidden="true" className="h-4 w-4" />
        <span className="hidden sm:inline">搜索</span>
        <kbd className="search-kbd">Ctrl+K</kbd>
      </button>

      {open && (
        <div className="search-backdrop" onClick={close}>
          <div className="search-modal" onClick={(e) => e.stopPropagation()}>
            <div className="search-input-row">
              <Search aria-hidden="true" className="h-4 w-4 text-[var(--muted-foreground)]" />
              <input
                ref={inputRef}
                className="search-input"
                type="text"
                placeholder="搜索任务、事件、灵感、纪念日、礼物..."
                value={query}
                onChange={(e) => onInput(e.target.value)}
              />
              <button type="button" className="search-close" onClick={close}>
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
            <div className="search-results">
              {loading && <p className="search-status">搜索中...</p>}
              {!loading && query.trim() && results.length === 0 && (
                <p className="search-status">未找到匹配结果</p>
              )}
              {!loading && results.map((item) => {
                const path = detailPaths[item.kind];
                const href = path ? `${path}/${item.id}` : "#";
                return (
                  <Link key={`${item.kind}-${item.id}`} className="search-result-item" href={href} onClick={close}>
                    <div className="search-result-main">
                      <span className="search-result-title">
                        {item.title.length > 80 ? `${item.title.slice(0, 80)}...` : item.title}
                      </span>
                      <span className="search-result-meta">
                        {item.label}
                        {item.date ? ` · ${item.date}` : ""}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
