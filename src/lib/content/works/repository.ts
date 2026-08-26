import { discoverAndParseContentWorks } from "./discovery";
import { isPublicContentUnit, isPublicWorkRepresentation } from "./normalize";
import { ContentWorkValidationError, validateContentWorks } from "./validation";
import type { ContentLanguage, TranslationStatus } from "@/types/content";
import type { ContentUnit, ContentWork, ContentWorkRepresentation, UnitTranslationResolution, WorkTranslationResolution } from "@/types/content-work";

function publicStatus(status: ContentWorkRepresentation["status"]): TranslationStatus {
  return status === "archived" || status === "scheduled" ? "draft" : status;
}

export function createContentWorkRepository(works: ContentWork[], units: ContentUnit[]) {
  const report = validateContentWorks(works, units);
  if (report.errors.length) throw new ContentWorkValidationError(report.errors);

  const findRepresentation = (work: ContentWork, locale: ContentLanguage) => work.representations.find((representation) => representation.language === locale);
  const getPublicWorkBySlug = (slug: string, locale: ContentLanguage) => {
    for (const work of works) {
      const representation = findRepresentation(work, locale);
      if (representation?.slug === slug && isPublicWorkRepresentation(representation)) return {work, representation};
    }
    return null;
  };
  const getPublicWorkByCanonicalId = (canonicalId: string, locale: ContentLanguage) => {
    const work = works.find((candidate) => candidate.canonicalId === canonicalId);
    if (!work) return null;
    const representation = findRepresentation(work, locale);
    return representation && isPublicWorkRepresentation(representation) ? {work, representation} : null;
  };
  const getOrderedUnits = (workCanonicalId: string, locale: ContentLanguage, publicOnly = true) => {
    const work = works.find((candidate) => candidate.canonicalId === workCanonicalId);
    if (!work) return [];
    const byCanonical = new Map(units.filter((unit) => unit.workCanonicalId === workCanonicalId && unit.language === locale).map((unit) => [unit.canonicalId, unit]));
    return [...work.units].sort((a, b) => a.order - b.order).flatMap((reference) => {
      const unit = byCanonical.get(reference.canonicalId);
      return unit && (!publicOnly || isPublicContentUnit(unit)) ? [unit] : [];
    });
  };
  const getPublicUnitBySlug = (workSlug: string, unitSlug: string, locale: ContentLanguage) => {
    const parent = getPublicWorkBySlug(workSlug, locale);
    if (!parent) return null;
    const unit = getOrderedUnits(parent.work.canonicalId, locale).find((candidate) => candidate.slug === unitSlug);
    return unit && isPublicContentUnit(unit) ? {...parent, unit} : null;
  };
  const resolvePublicWorkTranslation = (canonicalId: string, targetLocale: ContentLanguage, source?: ContentWorkRepresentation): WorkTranslationResolution => {
    const work = works.find((candidate) => candidate.canonicalId === canonicalId);
    const target = work && findRepresentation(work, targetLocale);
    if (!work || !target) return {status: "missing", available: false, work: null, representation: null};
    let status = publicStatus(target.status);
    if (status === "published" && source?.updatedAt && target.updatedAt && target.updatedAt < source.updatedAt) status = "outdated";
    if ((status === "published" || status === "outdated") && isPublicWorkRepresentation(target)) return {status, available: true, work, representation: target};
    return {status: status === "published" || status === "outdated" ? "unavailable" : status, available: false, work: null, representation: null};
  };
  const resolvePublicUnitTranslation = (canonicalId: string, targetLocale: ContentLanguage, source?: ContentUnit): UnitTranslationResolution => {
    const target = units.find((unit) => unit.canonicalId === canonicalId && unit.language === targetLocale);
    if (!target) return {status: "missing", available: false, work: null, workRepresentation: null, unit: null};
    const parent = getPublicWorkByCanonicalId(target.workCanonicalId, targetLocale);
    let status = publicStatus(target.status);
    if (status === "published" && source?.updatedAt && target.updatedAt && target.updatedAt < source.updatedAt) status = "outdated";
    if (parent && (status === "published" || status === "outdated") && isPublicContentUnit(target)) return {status, available: true, work: parent.work, workRepresentation: parent.representation, unit: target};
    return {status: status === "published" || status === "outdated" ? "unavailable" : status, available: false, work: null, workRepresentation: null, unit: null};
  };

  return {
    allWorks: () => [...works],
    allUnits: () => [...units],
    getPublishedWorks: (locale: ContentLanguage) => works.flatMap((work) => {
      const representation = findRepresentation(work, locale);
      return representation && isPublicWorkRepresentation(representation) ? [{work, representation}] : [];
    }),
    getPublicWorkBySlug,
    getPublicWorkByCanonicalId,
    getOrderedUnits,
    getPublicUnitBySlug,
    resolvePublicWorkTranslation,
    resolvePublicUnitTranslation,
    validationWarnings: () => [...report.warnings],
  };
}

export type ContentWorkRepository = ReturnType<typeof createContentWorkRepository>;
let repositoryPromise: Promise<ContentWorkRepository> | undefined;

export function getContentWorkRepository() {
  repositoryPromise ??= Promise.resolve().then(() => {
    const discovered = discoverAndParseContentWorks();
    return createContentWorkRepository(discovered.works, discovered.units);
  });
  return repositoryPromise;
}
