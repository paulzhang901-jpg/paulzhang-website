import type { ContentLanguage } from "@/types/content";
import type { ContentWorkRepository } from "./repository";

export function workPath(slug: string, locale: ContentLanguage) {
  return `${locale === "en-US" ? "/en" : ""}/stories/${slug}`;
}

export function unitPath(workSlug: string, unitSlug: string, locale: ContentLanguage) {
  return `${workPath(workSlug, locale)}/${unitSlug}`;
}

export function resolveWorkRoute(slug: string, locale: ContentLanguage, repository: ContentWorkRepository) {
  const result = repository.getPublicWorkBySlug(slug, locale);
  return result ? {kind: "work" as const, ...result} : {kind: "not-found" as const};
}

export function resolveUnitRoute(workSlug: string, unitSlug: string, locale: ContentLanguage, repository: ContentWorkRepository) {
  const result = repository.getPublicUnitBySlug(workSlug, unitSlug, locale);
  return result ? {kind: "unit" as const, ...result} : {kind: "not-found" as const};
}

export function getWorkStaticParams(locale: ContentLanguage, repository: ContentWorkRepository) {
  return repository.getPublishedWorks(locale).map(({representation}) => ({slug: representation.slug}));
}

export function getUnitStaticParams(locale: ContentLanguage, repository: ContentWorkRepository) {
  return repository.getPublishedWorks(locale).flatMap(({work, representation}) => repository.getOrderedUnits(work.canonicalId, locale).map((unit) => ({workSlug: representation.slug, unitSlug: unit.slug})));
}
