import fs from "fs";
import path from "path";
import matter from "gray-matter";

const GUIDES_DIR = path.join(process.cwd(), "content", "guides");

export type GuideMeta = {
  slug: string;
  title: string;
  description: string;
  category: string;
  minutes: number;
  updatedAt: string; // YYYY-MM-DD
};

export function getGuideSlugs(): string[] {
  if (!fs.existsSync(GUIDES_DIR)) return [];
  return fs
    .readdirSync(GUIDES_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export function getAllGuidesMeta(): GuideMeta[] {
  const slugs = getGuideSlugs();
  const list = slugs.map((slug) => {
    const fullPath = path.join(GUIDES_DIR, `${slug}.mdx`);
    const file = fs.readFileSync(fullPath, "utf8");
    const { data } = matter(file);

    return {
      slug,
      title: String(data.title ?? slug),
      description: String(data.description ?? ""),
      category: String(data.category ?? "General"),
      minutes: Number(data.minutes ?? 5),
      updatedAt: String(data.updatedAt ?? ""),
    };
  });

  return list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getGuideBySlug(slug: string) {
  const fullPath = path.join(GUIDES_DIR, `${slug}.mdx`);
  if (!fs.existsSync(fullPath)) return null;

  const file = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(file);

  const meta: GuideMeta = {
    slug,
    title: String(data.title ?? slug),
    description: String(data.description ?? ""),
    category: String(data.category ?? "General"),
    minutes: Number(data.minutes ?? 5),
    updatedAt: String(data.updatedAt ?? ""),
  };

  return { meta, content };
}