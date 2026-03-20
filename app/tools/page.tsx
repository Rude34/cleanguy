import Link from "next/link";
import TopSearch from "../components/TopSearch";
import { getAllTools } from "../../data/tools";
import ToolsClient from "./ToolsClient";

export const metadata = {
  title: "Tools | CleanGuy Tech",
};

export default function ToolsPage() {
  const tools = getAllTools();

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
            <nav className="flex gap-3 text-sm text-slate-300">
              <Link className="rounded-md px-2 py-1 hover:bg-slate-800 hover:text-cyan-300" href="/guides">Guides</Link>
              <Link className="rounded-md px-2 py-1 hover:bg-slate-800 hover:text-cyan-300" href="/tools">Tools</Link>
              <Link className="rounded-md px-2 py-1 hover:bg-slate-800 hover:text-cyan-300" href="/about">About</Link>
            </nav>
            <TopSearch />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-3xl font-bold text-cyan-100">Tools</h1>
        <p className="mt-2 max-w-2xl text-slate-300">
          Hızlı teşhis ve pratik şablonlar. Amaç: doğru adımı hızlı bulmak.
        </p>

        <ToolsClient tools={tools} />
      </section>

      <footer className="border-t border-slate-200">
        <div className="mx-auto max-w-5xl px-6 py-10 text-sm text-slate-500">
          © {new Date().getFullYear()} CleanGuy Tech — Windows troubleshooting tools.
        </div>
      </footer>
    </main>
  );
}

