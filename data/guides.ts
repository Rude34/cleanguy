import { getAllGuidesMeta, getGuideBySlug as getGuideBySlugFromMdx } from "../text/lib/guides";

export type GuideCategory =
  | "Network"
  | "Performance"
  | "BSOD"
  | "Windows"
  | "Security"
  | "Hardware";

export type Guide = {
  slug: string; // URL: /guides/{slug}
  title: string;
  description: string;
  category: GuideCategory;
  minutes: number; // tahmini okuma/uygulama süresi
  updatedAt: string; // YYYY-MM-DD
};

export type GuideDetail = Guide & {
  content: string;
};

export const guides: Guide[] = getAllGuidesMeta() as Guide[];

export function getGuide(slug: string): GuideDetail | undefined {
  const guideDetail = getGuideBySlugFromMdx(slug);
  if (!guideDetail) return undefined;
  
  return {
    ...guideDetail.meta,
    content: guideDetail.content,
  } as GuideDetail;
}
