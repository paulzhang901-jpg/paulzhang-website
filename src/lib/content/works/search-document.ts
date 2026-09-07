import type {SearchDocument} from "@/types/content";
import type {ContentWork, PublicWorkRepresentation} from "@/types/content-work";

export function createContentWorkSearchDocument(work: ContentWork, representation: PublicWorkRepresentation): SearchDocument {
  return {
    id: work.id,
    canonical_id: work.canonicalId,
    slug: representation.slug,
    language: representation.language,
    title: representation.title,
    summary: representation.summary,
    plain_text_excerpt: representation.summary.slice(0, 240),
    content_type: work.workType,
    topics: [],
    life_needs: [],
    journey_stages: [],
    audiences: [],
    published_at: representation.publishedAt.toISOString(),
  };
}
