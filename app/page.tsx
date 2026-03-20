import Link from "next/link";
import { guides } from "@/data/guides";

export const metadata = {
  title: "Home | CleanGuy Tech",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-linear-to-br from-blue-50 via-slate-50 to-white text-slate-900">
      <header className="border-b border-slate-200/50 backdrop-blur-sm sticky top-0 z-50 bg-white/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link href="/" className="font-bold tracking-tight text-lg">
            CleanGuy Tech <span className="text-blue-600">| Troubleshooting</span>
          </Link>
          <nav className="flex gap-6 text-sm text-slate-600">
            <Link className="hover:text-blue-600 transition-colors duration-200" href="/guides">Guides</Link>
            <Link className="hover:text-blue-600 transition-colors duration-200" href="/tools">Tools</Link>
            <Link className="hover:text-blue-600 transition-colors duration-200" href="/about">About</Link>
          </nav>
        </div>
      </header>

      <section className="relative mx-auto max-w-5xl px-6 py-24">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-200/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight text-transparent bg-linear-to-r from-slate-900 via-blue-600 to-cyan-600 bg-clip-text">
            Quickly resolve Windows problems.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-600 leading-relaxed">
            User-friendly troubleshooting content for network, performance, blue screen, and everyday problems.
            Each article progresses in clear, concise, and actionable steps.
          </p>

          <div className="mt-10 flex gap-4">
            <Link
              href="/guides"
              className="rounded-lg bg-linear-to-r from-blue-600 to-blue-500 px-6 py-3 text-sm font-semibold text-white hover:from-blue-500 hover:to-blue-400 transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
            >
              View guides →
            </Link>
            <Link
              href="/tools"
              className="rounded-lg border border-cyan-600/30 bg-cyan-600/5 px-6 py-3 text-sm font-semibold text-cyan-700 hover:bg-cyan-600/10 hover:border-cyan-500/50 transition-all duration-200"
            >
              Tools
            </Link>
          </div>
        </div>
      </section>

      <section id="guides" className="mx-auto max-w-5xl px-6 py-20 border-t border-slate-200/50">
        <div className="mb-12">
          <h2 className="text-3xl font-bold">Featured guides</h2>
          <div className="mt-2 h-1 w-20 bg-linear-to-r from-blue-600 to-cyan-600 rounded-full"></div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {guides.slice(0, 3).map((guide) => (
            <Link
              key={guide.slug}
              href={`/guides/${guide.slug}`}
              className="group rounded-2xl border border-slate-300/50 bg-linear-to-br from-slate-50/50 to-blue-50/30 p-6 hover:from-slate-100/60 hover:to-blue-100/40 transition-all duration-300 hover:border-blue-600/50 hover:shadow-lg hover:shadow-blue-600/10"
            >
              <div className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 group-hover:bg-blue-200 transition-colors">
                {guide.category}
              </div>
              <div className="mt-4 font-semibold text-lg group-hover:text-blue-600 transition-colors">{guide.title}</div>
              <div className="mt-3 text-sm text-slate-500 group-hover:text-slate-600 transition-colors">
                {guide.minutes}–{guide.minutes + 2} dakikada uygulanabilir adımlar.
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-400 group-hover:text-blue-600 transition-colors">
                Oku →
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200/50 bg-linear-to-b from-transparent to-blue-100">
        <div className="mx-auto max-w-5xl px-6 py-16 text-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} CleanGuy Tech — Windows troubleshooting guides.</p>
          <p className="mt-2 text-xs text-slate-400">Daha hızlı, daha kolay, daha etkili çözümler.</p>
        </div>
      </section>
    </main>
  );
}