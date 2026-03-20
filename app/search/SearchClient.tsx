"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type IndexedItem = {
  type: "guide" | "tool";
  slug: string;
  title: string;
  description: string;
  category?: string;
  path: string;
};

type SearchClientProps = {
  items: IndexedItem[];
  defaultQuery?: string;
};

export default function SearchClient({ items, defaultQuery = "" }: SearchClientProps) {
  const [query, setQuery] = useState(defaultQuery);


  const normalizedQuery = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!normalizedQuery) return items;
    return items.filter((item) => {
      return (
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.description.toLowerCase().includes(normalizedQuery) ||
        (item.category?.toLowerCase().includes(normalizedQuery) ?? false)
      );
    });
  }, [items, normalizedQuery]);

  return (
    <>
      <div className="mt-6">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Example: wifi, dns, driver..."
          className="w-full rounded-md border border-slate-700 bg-slate-900 px-4 py-2 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {filtered.map((item) => (
          <Link
            key={`${item.type}-${item.slug}`}
            href={item.path}
            className="rounded-2xl border border-slate-700 bg-slate-900/80 p-5 shadow-lg shadow-black/30 transition hover:-translate-y-1 hover:border-cyan-400 hover:bg-slate-800"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-cyan-300 uppercase">{item.type}</div>
              <div className="text-xs text-slate-400">{item.category || "General"}</div>
            </div>
            <div className="mt-2 text-lg font-semibold text-slate-100">{item.title}</div>
            <div className="mt-2 text-sm text-slate-300">{item.description}</div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-8 rounded-xl border border-red-600 bg-red-950/30 p-4 text-sm text-red-200">
          No results found. Try different keywords to improve your search.
        </div>
      )}
    </>
  );
}
