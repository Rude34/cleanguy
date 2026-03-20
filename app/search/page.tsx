import Link from "next/link";
import TopSearch from "../components/TopSearch";
import SearchClient from "./SearchClient";
import { guides } from "../../data/guides";
import { getAllTools } from "../../data/tools";

export const metadata = {
  title: "Search | CleanGuy Tech",
};

type IndexedItem = {
  type: "guide" | "tool";
  slug: string;
  title: string;
  description: string;
  category?: string;
  path: string;
};

export default function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const tools = getAllTools();
  const defaultQuery = searchParams.q?.trim() ?? "";

  const index: IndexedItem[] = [
    ...guides.map((g) => ({
      type: "guide" as const,
      slug: g.slug,
      title: g.title,
      description: g.description,
      category: g.category,
      path: `/guides/${g.slug}`,
    })),
    ...tools.map((t) => ({
      type: "tool" as const,
      slug: t.slug,
      title: t.title,
      description: t.desc,
      category: t.tag,
      path: `/tools/${t.slug}`,
    })),
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-700 bg-slate-900/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between px-6 py-4 gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="rounded-md bg-cyan-500 px-3 py-2 text-base font-bold text-slate-950 transition hover:bg-cyan-400">
              Home
            </Link>
            <h1 className="text-xl font-black text-cyan-300">CleanGuy Tech</h1>
            <span className="text-xs text-slate-400">Troubleshooting</span>
          </div>
          <div className="flex items-center gap-4">
            <TopSearch defaultValue={defaultQuery} />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-3xl font-bold text-cyan-100">Search</h1>
        <p className="mt-2 max-w-2xl text-slate-300">
          Search guides and tools by keyword to quickly find relevant content.
        </p>

        <SearchClient items={index} defaultQuery={defaultQuery} />
      </section>

      <footer className="border-t border-slate-200">
        <div className="mx-auto max-w-5xl px-6 py-10 text-sm text-slate-500">
          © {new Date().getFullYear()} CleanGuy Tech — Windows troubleshooting search.
        </div>
      </footer>
    </main>
  );
}

