import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import TopSearch from "../../components/TopSearch";
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
            <TopSearch />
          </div>
        </div>
      </header>

      <article className="mx-auto max-w-5xl px-6 py-12">
        <div className="text-xs text-cyan-300">{guide.category}</div>
        <h1 className="mt-2 text-3xl font-bold text-cyan-100">{guide.title}</h1>
        <p className="mt-3 max-w-2xl text-slate-300">{guide.description}</p>

        <div className="mt-10 rounded-2xl border border-slate-700 bg-slate-900/80 p-6 prose prose-invert max-w-none">
          <MDXRemote
            source={guide.content}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
              },
            }}
          />
        </div>

        <div className="mt-10">
          <Link
            href="/guides"
            className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-cyan-200 hover:bg-slate-700"
          >
            ← Back to all guides
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
