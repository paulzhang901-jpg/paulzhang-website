import type { ParsedContentRecord } from "./discovery";
import type { NormalizedContentItem, PublishedContentItem } from "@/types/content";

export function normalizeContent(record: ParsedContentRecord): NormalizedContentItem {
  const {frontmatter: item} = record;
  return {
    id: item.id,
    canonicalId: item.canonical_id,
    slug: item.slug,
    domain: record.domain,
    language: item.language,
    status: item.status,
    contentType: item.content_type,
    title: item.title,
    subtitle: item.subtitle,
    summary: item.summary,
    topics: [...item.topics],
    lifeNeeds: [...item.life_needs],
    journeyStages: [...item.journey_stages],
    audiences: [...item.audiences],
    authors: [...item.authors],
    publishedAt: item.published_at ? new Date(item.published_at) : undefined,
    updatedAt: item.updated_at ? new Date(item.updated_at) : undefined,
    visibility: item.visibility,
    accessLevel: item.access_level,
    scriptureRefs: item.scripture_refs.map((reference) => ({
      book: reference.book,
      chapterStart: reference.chapter_start,
      verseStart: reference.verse_start,
      chapterEnd: reference.chapter_end,
      verseEnd: reference.verse_end,
    })),
    formation: {
      intent: item.formation_intent,
      reflectionPrompts: [...item.reflection_prompts],
      practices: [...item.practices],
      discussionQuestions: [...item.discussion_questions],
      prayerPrompt: item.prayer_prompt,
      mentorPrompt: item.mentor_prompt,
      nextSteps: item.next_steps.map((step) => ({...step})),
    },
    relatedContent: [...item.related_content],
    seo: {...item.seo},
    body: record.body,
    sourcePath: record.sourcePath,
  };
}

export function isPublicContent(item: NormalizedContentItem): item is PublishedContentItem {
  return item.status === "published" && item.visibility === "public" && item.accessLevel === "public" && item.publishedAt instanceof Date;
}
