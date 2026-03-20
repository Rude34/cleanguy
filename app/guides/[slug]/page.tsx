import Link from "next/link";
import { notFound } from "next/navigation";
import { getGuide } from "../../../data/guides";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { getGuide } = await import("../../../data/guides");
  const guide = getGuide(params.slug);
  if (!guide) {
    return { title: "Not Found | CleanGuy Tech" };
  }
  return { title: `${guide.title} | CleanGuy Tech` };
}

export default async function GuideDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getGuide(slug);

  if (!guide) return notFound();

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
        <div className="text-xs text-blue-600">{guide.category}</div>
        <h1 className="mt-2 text-3xl font-bold">{guide.title}</h1>
        <p className="mt-3 max-w-2xl text-slate-600">{guide.description}</p>
        <div className="mt-4 text-sm text-slate-400">
          ~{guide.minutes} min • Updated {guide.updatedAt}
        </div>

        <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <pre className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
            {guide.content.trim()}
          </pre>
        </div>

        <div className="mt-10">
          <Link
            href="/guides"
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100"
          >
            ← Tüm rehberlere dön
          </Link>
        </div>
      </article>

      <footer className="border-t border-slate-200">
        <div className="mx-auto max-w-5xl px-6 py-10 text-sm text-slate-500">
          © {new Date().getFullYear()} CleanGuy Tech — Windows troubleshooting
          guides.
        </div>
      </footer>
    </main>
  );
}
