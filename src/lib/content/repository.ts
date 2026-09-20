import { discoverAndParseContent } from "./discovery";
import { ContentValidationError, validateContentRecords } from "./validation";
import { createSearchDocument } from "./search-document";
import { findRelatedContent } from "./related";
import { isPublicContent } from "./normalize";
import type { ContentDomain, ContentLanguage, NormalizedContentItem, PublicContentProjection, PublicTranslationResolution, TranslationResolution } from "@/types/content";

export type ContentRepository = ReturnType<typeof createContentRepository>;

export function createContentRepository(items: NormalizedContentItem[]) {
  const identityErrors = validateRepositoryIdentities(items);
  if (identityErrors.length) throw new ContentValidationError(identityErrors);
  const bySlug = new Map(items.map((item) => [`${item.language}:${item.domain}:${item.slug}`, item]));
  const byCanonical = new Map<string, NormalizedContentItem[]>();
  for (const item of items) byCanonical.set(item.canonicalId, [...(byCanonical.get(item.canonicalId) ?? []), item]);
  const publicItems = items.filter(isPublicContent).sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  const toPublicProjection = (item: NormalizedContentItem): PublicContentProjection => ({
    id: item.id, canonicalId: item.canonicalId, slug: item.slug, domain: item.domain, language: item.language,
    contentType: item.contentType, primaryTopic: item.primaryTopic, secondaryTopics: [...item.secondaryTopics],
    growthStages: [...item.growthStages], lifeDomains: [...item.lifeDomains], title: item.title, summary: item.summary,
    topics: [...item.topics], lifeNeeds: [...item.lifeNeeds], audiences: [...item.audiences],
    publishedAt: item.publishedAt, updatedAt: item.updatedAt, scriptureRefs: item.scriptureRefs.map((entry) => ({...entry})),
    canonicalUrl: item.canonicalUrl,
  });

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
    getPublicProjection: (language?: ContentLanguage) => publicItems.filter((item) => !language || item.language === language).map(toPublicProjection),
    getContentByContentType: (contentType: string, language?: ContentLanguage) => publicItems.filter((item) => item.contentType === contentType && (!language || item.language === language)),
    getContentByPrimaryTopic: (topic: string, language?: ContentLanguage) => publicItems.filter((item) => item.primaryTopic === topic && (!language || item.language === language)),
    getContentBySecondaryTopic: (topic: string, language?: ContentLanguage) => publicItems.filter((item) => item.secondaryTopics.includes(topic) && (!language || item.language === language)),
    getContentByGrowthStage: (stage: string, language?: ContentLanguage) => publicItems.filter((item) => item.growthStages.includes(stage) && (!language || item.language === language)),
    getContentByLifeDomain: (domain: string, language?: ContentLanguage) => publicItems.filter((item) => item.lifeDomains.includes(domain) && (!language || item.language === language)),
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

function validateRepositoryIdentities(items: NormalizedContentItem[]) {
  const errors: string[] = [];
  const canonicalLocale = new Set<string>();
  const slugs = new Set<string>();
  for (const item of items) {
    const canonicalKey = `${item.canonicalId}:${item.language}`;
    if (canonicalLocale.has(canonicalKey)) errors.push(`duplicate canonical_id + locale: ${canonicalKey}`);
    canonicalLocale.add(canonicalKey);
    const slugKey = `${item.language}:${item.domain}:${item.slug}`;
    if (slugs.has(slugKey)) errors.push(`duplicate slug within locale/domain: ${slugKey}`);
    slugs.add(slugKey);
  }
  return errors;
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
