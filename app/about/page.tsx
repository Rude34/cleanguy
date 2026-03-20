import Link from "next/link";

export const metadata = {
  title: "About | CleanGuy Tech",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-700 bg-slate-900/95 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between px-6 py-4 gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="rounded-md bg-cyan-500 px-3 py-2 text-base font-bold text-slate-950 transition hover:bg-cyan-400">
              Home
            </Link>
            <h1 className="text-xl font-black text-cyan-300">CleanGuy Tech</h1>
            <span className="text-xs text-slate-400">Troubleshooting</span>
          </div>
          <nav className="flex gap-3 text-sm text-slate-300">
            <Link className="rounded-md px-2 py-1 hover:bg-slate-800 hover:text-cyan-300 transition-colors duration-200" href="/guides">Guides</Link>
            <Link className="rounded-md px-2 py-1 hover:bg-slate-800 hover:text-cyan-300 transition-colors duration-200" href="/tools">Tools</Link>
            <Link className="rounded-md px-2 py-1 hover:bg-slate-800 hover:text-cyan-300 transition-colors duration-200" href="/about">About</Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-20">
        <div>
          <h1 className="text-4xl font-bold text-cyan-100">About Us</h1>
          <div className="mt-2 h-1 w-20 bg-linear-to-r from-cyan-500 to-blue-500 rounded-full"></div>
        </div>

        <div className="mt-12 space-y-8 text-slate-300">
          <div>
            <h2 className="text-2xl font-semibold text-cyan-200 mb-3">Who are we?</h2>
            <p className="leading-relaxed">
              CleanGuy Tech is a platform built to help Windows users resolve daily issues with quick, practical steps. We provide step‑by‑step guides for everything from network problems and performance tuning to blue screen errors and security concerns.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">Our mission</h2>
            <p className="leading-relaxed">
              To give people searching for Windows fixes online short, clear, and actionable solutions instead of lengthy, complicated articles. Each guide is prepared according to these principles:
            </p>
            <ul className="mt-4 space-y-2 ml-4">
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">✓</span>
                <span><strong>Clear:</strong> No unnecessary details, straight to the fix</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">✓</span>
                <span><strong>Short:</strong> Steps you can do in 5–10 minutes</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">✓</span>
                <span><strong>Easy:</strong> Can be performed by users with basic technical knowledge</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">✓</span>
                <span><strong>Safe:</strong> Correct and tested solutions</span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">What we offer</h2>
            <p className="leading-relaxed">
              <span className="font-semibold">Guides:</span> Detailed troubleshooting walkthroughs (Network, Performance, BSOD, Security, etc.)
            </p>
            <p className="leading-relaxed mt-2">
              <span className="font-semibold">Tools:</span> Quick diagnostics and handy templates
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">İletişim</h2>
            <p className="leading-relaxed">
              Sorularınız, önerileriniz veya hata raporları için bizimle iletişime geçebilirsiniz. Sizin geri bildiriminiz platformu daha iyi hale getiriyor.
            </p>
          </div>
        </div>

        <div className="mt-16">
            <Link
              href="/guides"
              className="inline-block rounded-lg bg-linear-to-r from-cyan-500 to-blue-500 px-6 py-3 text-sm font-semibold text-white hover:from-cyan-400 hover:to-blue-400 transition-all duration-200 shadow-lg hover:shadow-cyan-500/25"
            >
              Rehberleri Gör →
            </Link>
          </div>
        </section>

        <section className="border-t border-slate-800 bg-slate-950">
          <div className="mx-auto max-w-5xl px-6 py-16 text-center text-sm text-slate-400">
            <p>© {new Date().getFullYear()} CleanGuy Tech — Windows troubleshooting guides.</p>
            <p className="mt-2 text-xs text-slate-500">Daha hızlı, daha kolay, daha etkili çözümler.</p>
          </div>
        </section>
    </main>
  );
}
