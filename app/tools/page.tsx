import Link from "next/link";
import { getAllTools, type Tool } from "../../data/tools";

export const metadata = {
  title: "Tools | CleanGuy Tech",
};

export default function ToolsPage() {
  const tools = getAllTools();

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
        <h1 className="text-3xl font-bold">Tools</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Hızlı teşhis ve pratik şablonlar. Amaç: doğru adımı hızlı bulmak.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {tools.map((t: Tool) => (
            <Link
              key={t.slug}
              href={`/tools/${t.slug}`}
              className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 hover:bg-slate-100/50"
            >
              <div className="flex items-center justify-between">
                <div className="text-xs text-blue-600">{t.tag}</div>
                <div className="text-xs text-slate-400">Tool</div>
              </div>
              <div className="mt-2 text-lg font-semibold">{t.title}</div>
              <div className="mt-2 text-sm text-slate-600">{t.desc}</div>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200">
        <div className="mx-auto max-w-5xl px-6 py-10 text-sm text-slate-500">
          © {new Date().getFullYear()} CleanGuy Tech — Windows troubleshooting
          tools.
        </div>
      </footer>
    </main>
  );
}
