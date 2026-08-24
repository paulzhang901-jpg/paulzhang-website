import type { ParsedContentRecord } from "./discovery";
import { normalizeContent } from "./normalize";
import type { ContentLanguage, NormalizedContentItem } from "@/types/content";

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
    if (!item.seo.title) warnings.push(`${item.sourcePath}: optional SEO title missing`);
    if (!item.formation.reflectionPrompts.length) warnings.push(`${item.sourcePath}: optional reflection prompts missing`);
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
