"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { type Guide } from "../../data/guides";

type Props = {
  guides: Guide[];
};

export default function GuidesClient({ guides }: Props) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return guides;
    const q = search.trim().toLowerCase();
    return guides.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q)
    );
  }, [search, guides]);

  return (
    <>
      <div className="mt-6 flex items-center justify-between gap-4">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Rehberlerde ara (örn. wifi, dns, performans)"
          className="w-full max-w-sm rounded-md border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500"
        />
        <div className="text-sm text-slate-400">
          {filtered.length}/{guides.length} sonuç gösteriliyor.
        </div>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-3 md:grid-cols-2">
        {filtered.map((g) => (
          <Link
            key={g.slug}
            href={`/guides/${g.slug}`}
            className="rounded-2xl border border-slate-700 bg-slate-900/80 p-5 shadow-lg shadow-black/30 transition hover:-translate-y-1 hover:border-cyan-400 hover:bg-slate-800"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="rounded-md bg-cyan-500/20 px-2 py-1 text-xs font-semibold text-cyan-300">{g.category}</div>
              <div className="text-xs text-slate-400">~{g.minutes} min • {g.updatedAt}</div>
            </div>
            <div className="mt-3 text-xl font-bold text-cyan-200">{g.title}</div>
            <div className="mt-2 text-sm text-slate-300">{g.description}</div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
          Aradığınız kriterde bir rehber bulunamadı.
        </div>
      )}
    </>
  );
}
