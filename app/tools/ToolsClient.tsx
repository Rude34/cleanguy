"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { type Tool } from "../../data/tools";

type Props = {
  tools: Tool[];
};

export default function ToolsClient({ tools }: Props) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return tools;
    const q = search.trim().toLowerCase();
    return tools.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.desc.toLowerCase().includes(q) ||
        t.tag.toLowerCase().includes(q)
    );
  }, [search, tools]);

  return (
    <>
      <div className="mt-6 flex items-center justify-between gap-4">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Araçlar içinde ara (örn. wifi, reset, şablon)"
          className="w-full max-w-sm rounded-md border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500"
        />
        <div className="text-sm text-slate-400">
          {filtered.length}/{tools.length} sonuç gösteriliyor.
        </div>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {filtered.map((t) => (
          <Link
            key={t.slug}
            href={`/tools/${t.slug}`}
            className="rounded-2xl border border-slate-700 bg-slate-900/80 p-5 shadow-lg shadow-black/30 transition hover:-translate-y-1 hover:border-cyan-400 hover:bg-slate-800"
          >
            <div className="flex items-center justify-between">
              <div className="text-xs text-cyan-300">{t.tag}</div>
              <div className="text-xs text-slate-400">Tool</div>
            </div>
            <div className="mt-2 text-lg font-semibold text-slate-100">{t.title}</div>
            <div className="mt-2 text-sm text-slate-300">{t.desc}</div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-8 rounded-xl border border-red-600 bg-red-950/30 p-4 text-sm text-red-200">
          Aradığınız kriterde bir araç bulunamadı.
        </div>
      )}
    </>
  );
}
