import Link from "next/link";
import { guides } from "../../data/guides";

export const metadata = {
  title: "Guides | CleanGuy Tech",
};

export default function GuidesPage() {
  const sorted = [...guides].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt)
  );

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link href="/" className="font-bold tracking-tight text-lg">
            CleanGuy Tech <span className="text-blue-600">| Troubleshooting</span>
          </Link>
          <nav className="flex gap-4 text-sm text-slate-600">
            <Link className="hover:text-blue-600" href="/guides">
              Guides
            </Link>
            <Link className="hover:text-blue-600" href="/tools">
              Tools
            </Link>
            <Link className="hover:text-blue-600" href="/about">
              About
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-3xl font-bold">Guides</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Windows troubleshooting rehberleri. Kategoriye göre filtrelemeyi birazdan ekleriz.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {sorted.map((g) => (
            <Link
              key={g.slug}
              href={`/guides/${g.slug}`}
              className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 hover:bg-slate-100/50"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="text-xs text-blue-600">{g.category}</div>
                <div className="text-xs text-slate-400">
                  ~{g.minutes} min • {g.updatedAt}
                </div>
              </div>
              <div className="mt-2 text-lg font-semibold">{g.title}</div>
              <div className="mt-2 text-sm text-slate-600">{g.description}</div>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200">
        <div className="mx-auto max-w-5xl px-6 py-10 text-sm text-slate-500">
          © {new Date().getFullYear()} CleanGuy Tech — Windows troubleshooting guides.
        </div>
      </footer>
    </main>
  );
}