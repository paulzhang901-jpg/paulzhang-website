import type { NormalizedContentItem, SearchDocument } from "@/types/content";
import { isPublicContent } from "./normalize";

export function toPlainText(markdown: string) {
  return markdown
    .replace(/<[^>]+>/g, " ")
    .replace(/[`*_>#\[\]()!-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function createSearchDocument(item: NormalizedContentItem): SearchDocument | null {
  if (!isPublicContent(item)) return null;
  return {
    id: item.id,
    canonical_id: item.canonicalId,
    slug: item.slug,
    language: item.language,
    title: item.title,
    summary: item.summary,
    plain_text_excerpt: toPlainText(item.body).slice(0, 240),
    content_type: item.contentType,
    topics: [...item.topics],
    life_needs: [...item.lifeNeeds],
    journey_stages: [...item.journeyStages],
    audiences: [...item.audiences],
    published_at: item.publishedAt.toISOString(),
  };
}
