/**
 * Site-wide editable content (hero, corporate cases, FAQ).
 *
 * Same GitHub-storage pattern que products-overrides :
 *   - data/site-content.json bundlé au build (fallback)
 *   - GitHub API pour lire la version la plus fraîche
 *   - Admin PATCH écrit sur GitHub + revalidateTag
 *
 * Consommé par : components/HeroB2B, components/CorporateShowcase, components/FAQ.
 */

import { unstable_cache, revalidateTag, revalidatePath } from "next/cache";
import { isGitHubStorageConfigured, readJsonFromRepo, writeJsonToRepo } from "@/lib/github-storage";
import bundled from "@/data/site-content.json";

const FILE_PATH = "data/site-content.json";
export const SITE_CONTENT_TAG = "site-content";
const REVALIDATE_SECONDS = 30;

export type HeroContent = {
  badge: string;
  titleLine1: string;
  titleHighlight1: string;
  titleHighlight2: string;
  subtitle: string;
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
  imageUrl: string;
  imageAlt: string;
};

export type CorporateCase = {
  tag: string;
  title: string;
  body: string;
  image: string;
  accent: string;
};

export type CorporateContent = {
  sectionTag: string;
  sectionTitle: string;
  sectionSubtitle: string;
  logos: string[];
  cases: CorporateCase[];
};

export type FAQItem = { q: string; a: string };

export type SiteContent = {
  hero: HeroContent;
  corporate: CorporateContent;
  faq: FAQItem[];
};

async function fetchContentFresh(): Promise<SiteContent> {
  if (isGitHubStorageConfigured()) {
    try {
      const result = await readJsonFromRepo<SiteContent>(FILE_PATH);
      if (result) return result.data;
    } catch (err) {
      console.warn("[site-content] GitHub read failed:", err);
    }
  }
  return bundled as SiteContent;
}

const getContentCached = unstable_cache(
  fetchContentFresh,
  ["site-content"],
  { revalidate: REVALIDATE_SECONDS, tags: [SITE_CONTENT_TAG] },
);

export async function getSiteContent(): Promise<SiteContent> {
  return getContentCached();
}

export async function writeSiteContent(next: SiteContent): Promise<void> {
  if (!isGitHubStorageConfigured()) {
    throw new Error("GitHub storage not configured");
  }
  await writeJsonToRepo(FILE_PATH, next, `admin: update site content (${new Date().toISOString()})`);
  revalidateTag(SITE_CONTENT_TAG);
  revalidatePath("/", "layout");
  revalidatePath("/faq", "page");
}
