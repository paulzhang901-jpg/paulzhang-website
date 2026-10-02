import type { ParsedContentRecord } from "./discovery";
import { normalizeContent } from "./normalize";
import type { ContentLanguage, NormalizedContentItem } from "@/types/content";
import {findDuplicateSermonTitleInOpening} from "@/lib/sermons/display";
import {getTogetherReferenceRegistry,getTogetherSectionIds} from "./together";

export type ContentValidationReport = {items: NormalizedContentItem[]; errors: string[]; warnings: string[]};

export function validateContentRecords(records: ParsedContentRecord[]): ContentValidationReport {
  const items = records.map(normalizeContent);
  const errors: string[] = [];
  const warnings: string[] = [];
  const slugKeys = new Set<string>();
  const localeCanonicalKeys = new Set<string>();
  const canonicalIds = new Set(items.map((item) => item.canonicalId));

  for (const item of items) {
    const slugKey = `${item.language}:${item.domain}:${item.slug}`;
    if (slugKeys.has(slugKey)) errors.push(`duplicate slug within locale/domain: ${slugKey}`);
    slugKeys.add(slugKey);

    const canonicalKey = `${item.canonicalId}:${item.language}`;
    if (localeCanonicalKeys.has(canonicalKey)) errors.push(`duplicate canonical_id + locale: ${canonicalKey}`);
    localeCanonicalKeys.add(canonicalKey);

    for (const target of item.relatedContent) if (!canonicalIds.has(target)) errors.push(`${item.sourcePath}: broken related_content reference ${target}`);
    for (const step of item.formation.nextSteps) {
      if (step.type === "content" && !canonicalIds.has(step.target)) errors.push(`${item.sourcePath}: broken next_steps content reference ${step.target}`);
    }
    if (item.contentType === "sermon" && item.status === "published") {
      const duplicateTitle = findDuplicateSermonTitleInOpening(item.body, item.title, item.language);
      if (duplicateTitle) errors.push(`${item.sourcePath}: published sermon body repeats page title at body line ${duplicateTitle.line}: ${duplicateTitle.value}`);
    }
    if (!item.seo.title) warnings.push(`${item.sourcePath}: optional SEO title missing`);
    if (!item.formation.reflectionPrompts.length) warnings.push(`${item.sourcePath}: optional reflection prompts missing`);
  }

  for (const reference of getTogetherReferenceRegistry().references) {
    if (!getTogetherSectionIds().includes(reference.section)) errors.push("Together reference uses unknown section " + reference.section);
    const targets=items.filter(item=>item.canonicalId===reference.canonical_id);
    if (!targets.length) errors.push("Together reference has broken canonical_id " + reference.canonical_id);
    for (const target of targets) if (target.domain!==reference.target_domain) errors.push("Together reference target domain mismatch for " + reference.canonical_id);
    for (const locale of ["zh-CN","en-US"] as ContentLanguage[]) if (!targets.some(target=>target.language===locale)) errors.push("Together reference missing " + locale + " target for " + reference.canonical_id);
  }

  const locales: ContentLanguage[] = ["zh-CN", "en-US"];
  for (const canonicalId of canonicalIds) {
    for (const locale of locales) {
      if (!items.some((item) => item.canonicalId === canonicalId && item.language === locale)) {
        warnings.push(`${canonicalId}: translation missing for ${locale}`);
      }
    }
  }
  return {items, errors, warnings};
}

export class ContentValidationError extends Error {
  constructor(public readonly errors: string[]) { super(`Content validation failed:\n${errors.join("\n")}`); }
}
