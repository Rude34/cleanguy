import Link from "next/link";
import { notFound } from "next/navigation";
import { getTool } from "../../../data/tools";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { getTool } = await import("../../../data/tools");
  const tool = getTool(params.slug);
  if (!tool) {
    return { title: "Not Found | CleanGuy Tech" };
  }
  return { title: `${tool.title} | CleanGuy Tech` };
}

export default async function ToolDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getTool(slug);

  if (!tool) return notFound();

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

      <article className="mx-auto max-w-5xl px-6 py-12">
        <div className="text-xs text-blue-600">{tool.tag}</div>
        <h1 className="mt-2 text-3xl font-bold">{tool.title}</h1>
        <p className="mt-3 max-w-2xl text-slate-600">{tool.desc}</p>

        <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <pre className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
            {tool.content}
          </pre>
        </div>

        <div className="mt-10">
          <Link
            href="/tools"
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100"
          >
            ← Tüm araçlara dön
          </Link>
        </div>
      </article>

      <footer className="border-t border-slate-200">
        <div className="mx-auto max-w-5xl px-6 py-10 text-sm text-slate-500">
          © {new Date().getFullYear()} CleanGuy Tech — Windows troubleshooting
          tools.
        </div>
      </footer>
    </main>
  );
}
