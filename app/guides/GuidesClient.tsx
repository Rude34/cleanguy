"use client";

import Link from "next/link";
import { useState, useCallback } from "react";
import { type Guide } from "../../data/guides";

type Props = {
  guides: Guide[];
};

export default function GuidesClient({ guides }: Props) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = [
    { key: "all", label: "All" },
    { key: "network", label: "Network & Internet" },
    { key: "audio", label: "Audio & Sound" },
    { key: "windows", label: "Windows Errors" },
    { key: "performance", label: "System & Performance" },
    { key: "apps", label: "Apps & Software" },
  ];

  const isInCategory = useCallback((guide: Guide) => {
    if (activeCategory === "all") return true;
    if (activeCategory === "network") return guide.category === "Network";
    if (activeCategory === "audio") return guide.category === "Audio";
    if (activeCategory === "windows") return guide.category === "Windows";
    if (activeCategory === "performance") return guide.category === "Performance";
    if (activeCategory === "apps") return guide.category === "Apps";
    return true;
  }, [activeCategory]);

  const filtered = guides
    .filter(isInCategory)
    .filter((g) => {
      if (!search.trim()) return true;
      const q = search.trim().toLowerCase();
      return (
        g.title.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q)
      );
    });

  return (
    <>
      <div className="mt-6 flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.key}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeCategory === category.key
                ? "bg-cyan-500 text-slate-950"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
            onClick={() => setActiveCategory(category.key)}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search guides (e.g., wifi, dns, performance)"
          className="w-full max-w-sm rounded-md border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500"
        />
        <div className="text-sm text-slate-400">
          Showing {filtered.length} of {guides.length} guides.
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
            </div>
            <div className="mt-3 text-xl font-bold text-cyan-200">{g.title}</div>
            <div className="mt-2 text-sm text-slate-300">{g.description}</div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-8 rounded-xl border border-slate-700 bg-slate-900/80 p-4 text-sm text-slate-200">
          No guides match your criteria.
        </div>
      )}
    </>
  );
}
