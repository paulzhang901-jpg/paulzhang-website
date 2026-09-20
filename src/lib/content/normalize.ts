import type { ParsedContentRecord } from "./discovery";
import type { NormalizedContentItem, PublishedContentItem } from "@/types/content";

export function canonicalContentPath(domain: NormalizedContentItem["domain"], slug: string, language: NormalizedContentItem["language"]) {
  const prefix = language === "en-US" ? "/en" : "";
  const segment = domain === "growth" ? "grow" : domain === "pages" ? "" : domain;
  return `${prefix}/${segment ? `${segment}/` : ""}${slug}`;
}

export function normalizeContent(record: ParsedContentRecord): NormalizedContentItem {
  const {frontmatter: item} = record;
  const canonical = "schema_version" in item;
  const legacyTopics = canonical ? [] : item.topics;
  const secondaryTopics = canonical ? item.secondary_topics : legacyTopics;
  const growthStages = canonical ? item.growth_stages : item.journey_stages;
  return {
    schemaVersion: canonical ? 2 : 1,
    id: item.id,
    canonicalId: item.canonical_id,
    slug: item.slug,
    domain: record.domain,
    language: item.language,
    status: item.status,
    contentType: item.content_type,
    primaryTopic: canonical ? item.primary_topic : legacyTopics.length === 1 ? legacyTopics[0] : undefined,
    secondaryTopics: [...secondaryTopics],
    growthStages: [...growthStages],
    lifeDomains: canonical ? [...item.life_domains] : [],
    title: item.title,
    subtitle: item.subtitle,
    summary: item.summary,
    topics: [...secondaryTopics],
    lifeNeeds: [...item.life_needs],
    journeyStages: [...growthStages],
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
    canonicalUrl: canonicalContentPath(record.domain, item.slug, item.language),
  };
}

export function isPublicContent(item: NormalizedContentItem): item is PublishedContentItem {
  return item.status === "published" && item.visibility === "public" && item.accessLevel === "public" && item.publishedAt instanceof Date;
}
