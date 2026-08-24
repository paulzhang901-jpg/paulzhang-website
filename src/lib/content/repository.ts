import { discoverAndParseContent } from "./discovery";
import { ContentValidationError, validateContentRecords } from "./validation";
import { createSearchDocument } from "./search-document";
import { findRelatedContent } from "./related";
import { isPublicContent } from "./normalize";
import type { ContentDomain, ContentLanguage, NormalizedContentItem, PublicTranslationResolution, TranslationResolution } from "@/types/content";

export type ContentRepository = ReturnType<typeof createContentRepository>;

export function createContentRepository(items: NormalizedContentItem[]) {
  const bySlug = new Map(items.map((item) => [`${item.language}:${item.domain}:${item.slug}`, item]));
  const byCanonical = new Map<string, NormalizedContentItem[]>();
  for (const item of items) byCanonical.set(item.canonicalId, [...(byCanonical.get(item.canonicalId) ?? []), item]);
  const publicItems = items.filter(isPublicContent).sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

  const resolveTranslation = (canonicalId: string, targetLocale: ContentLanguage, source?: NormalizedContentItem): TranslationResolution => {
    const target = (byCanonical.get(canonicalId) ?? []).find((item) => item.language === targetLocale);
    if (!target) return {status: "missing", item: null};
    let status: TranslationResolution["status"] = target.status === "archived" || target.status === "scheduled" ? "draft" : target.status;
    if (status === "published" && source?.updatedAt && target.updatedAt && target.updatedAt < source.updatedAt) status = "outdated";
    return {status, item: target};
  };

  const resolvePublicTranslation = (canonicalId: string, targetLocale: ContentLanguage, source?: NormalizedContentItem): PublicTranslationResolution => {
    const resolution = resolveTranslation(canonicalId, targetLocale, source);
    if (resolution.status === "missing") return {status: "missing", available: false, item: null};
    if ((resolution.status === "published" || resolution.status === "outdated") && isPublicContent(resolution.item)) {
      return {status: resolution.status, available: true, item: resolution.item};
    }
    if (resolution.status === "published" || resolution.status === "outdated") return {status: "unavailable", available: false, item: null};
    return {status: resolution.status, available: false, item: null};
  };

  return {
    all: () => [...items],
    getContentBySlug: (domain: ContentDomain, slug: string, language: ContentLanguage, publicOnly = true) => {
      const item = bySlug.get(`${language}:${domain}:${slug}`) ?? null;
      return item && (!publicOnly || isPublicContent(item)) ? item : null;
    },
    getContentByCanonicalId: (canonicalId: string, language?: ContentLanguage, publicOnly = true) => {
      const matches = byCanonical.get(canonicalId) ?? [];
      return matches.filter((item) => (!language || item.language === language) && (!publicOnly || isPublicContent(item)));
    },
    getPublishedContent: (language?: ContentLanguage) => publicItems.filter((item) => !language || item.language === language),
    getContentByTopic: (topic: string, language?: ContentLanguage) => publicItems.filter((item) => item.topics.includes(topic) && (!language || item.language === language)),
    getContentByLifeNeed: (lifeNeed: string, language?: ContentLanguage) => publicItems.filter((item) => item.lifeNeeds.includes(lifeNeed) && (!language || item.language === language)),
    getContentByJourneyStage: (stage: string, language?: ContentLanguage) => publicItems.filter((item) => item.journeyStages.includes(stage) && (!language || item.language === language)),
    getRelatedContent: (item: NormalizedContentItem, limit?: number) => findRelatedContent(item, items, limit),
    getSearchDocuments: (language?: ContentLanguage) => publicItems.filter((item) => !language || item.language === language).flatMap((item) => {
      const document = createSearchDocument(item);
      return document ? [document] : [];
    }),
    resolveTranslation,
    resolvePublicTranslation,
  };
}

let repositoryPromise: Promise<ContentRepository> | undefined;

export function getContentRepository() {
  repositoryPromise ??= Promise.resolve().then(() => {
    const report = validateContentRecords(discoverAndParseContent());
    if (report.errors.length) throw new ContentValidationError(report.errors);
    return createContentRepository(report.items);
  });
  return repositoryPromise;
}
