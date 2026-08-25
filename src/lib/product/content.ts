import type { Locale } from "@/config/i18n";
import { getContentRepository } from "@/lib/content/repository";
import type { NormalizedContentItem } from "@/types/content";

export async function resolvePublicCurated(canonicalId: string, locale: Locale) {
  const repository = await getContentRepository();
  return repository.getContentByCanonicalId(canonicalId, locale, true)[0] ?? null;
}

export function contentHref(item: NormalizedContentItem, locale: Locale) {
  const prefix = locale === "en-US" ? "/en" : "";
  const segment = item.domain === "stories" ? "stories" : item.domain === "growth" ? "grow" : "library";
  return `${prefix}/${segment}/${item.slug}` as const;
}
