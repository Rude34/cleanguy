import Link from "next/link";
import TopSearch from "../components/TopSearch";

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
          <div className="flex items-center gap-4">
            <TopSearch />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-20">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">About</p>
          <h1 className="mt-3 text-4xl font-bold text-cyan-100">About CleanGuy Tech</h1>
          <div className="mt-2 h-1 w-20 bg-linear-to-r from-cyan-500 to-blue-500 rounded-full"></div>
        </div>

        <div className="mt-12 space-y-6 text-slate-300">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-lg shadow-cyan-950/20">
            <p className="text-lg leading-8 text-slate-200">
              CleanGuy Tech is a platform created to provide simple and effective solutions for common IT problems. The main goal of this website is to help users troubleshoot issues on their own, especially related to Windows systems and network connectivity. All guides are written in a clear and easy-to-follow format so that both beginners and intermediate users can benefit from them.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-7">
              <h2 className="mb-4 text-2xl font-semibold text-cyan-200">The project</h2>
              <p className="leading-8 text-slate-300">
                This project is developed by Furkan Yıldırım, an Information Technology student at Ensign College. Alongside his academic studies, he is focused on building real-world skills in troubleshooting, system analysis, and web development. CleanGuy Tech is part of his internship project, where he researches technical problems and turns them into practical guides for everyday users.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-linear-to-br from-cyan-500/10 via-slate-900/80 to-blue-500/10 p-7">
              <h2 className="mb-4 text-2xl font-semibold text-cyan-200">The vision</h2>
              <p className="leading-8 text-slate-300">
                The vision of CleanGuy Tech is to make technical knowledge more accessible and to help people become more confident in solving their own IT issues.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/50 p-7">
            <h2 className="mb-4 text-2xl font-semibold text-cyan-100">What users can expect</h2>
            <ul className="space-y-3 text-slate-300">
              <li className="flex items-start gap-3">
                <span className="mt-1 text-cyan-400">•</span>
                <span>Simple troubleshooting steps for Windows and connectivity issues</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 text-cyan-400">•</span>
                <span>Clear explanations that are easy for beginners to follow</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 text-cyan-400">•</span>
                <span>Practical guides based on real technical research and hands-on learning</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16">
            <Link
              href="/guides"
              className="inline-block rounded-lg bg-linear-to-r from-cyan-500 to-blue-500 px-6 py-3 text-sm font-semibold text-white hover:from-cyan-400 hover:to-blue-400 transition-all duration-200 shadow-lg hover:shadow-cyan-500/25"
            >
              View guides →
            </Link>
          </div>
        </section>

        <section className="border-t border-slate-800 bg-slate-950">
          <div className="mx-auto max-w-5xl px-6 py-16 text-center text-sm text-slate-400">
            <p>© {new Date().getFullYear()} CleanGuy Tech — Windows troubleshooting guides.</p>
            <p className="mt-2 text-xs text-slate-500">Faster, easier, more effective troubleshooting.</p>
          </div>
        </section>
    </main>
  );
}
