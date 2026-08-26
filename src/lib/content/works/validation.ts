import { getTaxonomyRegistry, validateWorkTaxonomy } from "@/lib/taxonomy/registry";
import type { ContentUnit, ContentWork } from "@/types/content-work";

export type ContentWorkValidationReport = {errors: string[]; warnings: string[]};

export function validateContentWorks(works: ContentWork[], units: ContentUnit[]): ContentWorkValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  const workCanonicalIds = new Set<string>();
  const workIds = new Set<string>();
  const workSlugs = new Set<string>();
  const membership = new Map<string, string>();
  const unitsByCanonical = new Map<string, ContentUnit[]>();
  const taxonomy = getTaxonomyRegistry();

  for (const unit of units) unitsByCanonical.set(unit.canonicalId, [...(unitsByCanonical.get(unit.canonicalId) ?? []), unit]);

  for (const work of works) {
    if (workIds.has(work.id)) errors.push(`duplicate work id: ${work.id}`);
    workIds.add(work.id);
    if (workCanonicalIds.has(work.canonicalId)) errors.push(`duplicate work canonical_id: ${work.canonicalId}`);
    workCanonicalIds.add(work.canonicalId);
    errors.push(...validateWorkTaxonomy(work.workType).map((error) => `${work.sourcePath}: ${error}`));

    for (const representation of work.representations) {
      const key = `${representation.language}:${representation.slug}`;
      if (workSlugs.has(key)) errors.push(`${work.sourcePath}: duplicate localized work slug ${key}`);
      workSlugs.add(key);
    }

    const orders = new Set<number>();
    for (const reference of work.units) {
      if (orders.has(reference.order)) errors.push(`${work.sourcePath}: duplicate unit order ${reference.order}`);
      orders.add(reference.order);
      if (reference.canonicalId === work.canonicalId) errors.push(`${work.sourcePath}: cyclic work/unit relationship ${work.canonicalId}`);
      const owner = membership.get(reference.canonicalId);
      if (owner && owner !== work.canonicalId) errors.push(`duplicate unit membership: ${reference.canonicalId} belongs to ${owner} and ${work.canonicalId}`);
      membership.set(reference.canonicalId, work.canonicalId);
      if (!(unitsByCanonical.get(reference.canonicalId)?.length)) errors.push(`${work.sourcePath}: missing referenced unit ${reference.canonicalId}`);
    }
  }

  const localizedIdentities = new Set<string>();
  const localizedSlugs = new Set<string>();
  for (const unit of units) {
    if (!taxonomy.unit_types.includes(unit.unitType)) errors.push(`${unit.sourcePath}: unknown unit_type: ${unit.unitType}`);
    const identity = `${unit.canonicalId}:${unit.language}`;
    if (localizedIdentities.has(identity)) errors.push(`duplicate unit canonical_id + locale: ${identity}`);
    localizedIdentities.add(identity);
    const slug = `${unit.workCanonicalId}:${unit.language}:${unit.slug}`;
    if (localizedSlugs.has(slug)) errors.push(`duplicate localized unit slug: ${slug}`);
    localizedSlugs.add(slug);

    const owner = membership.get(unit.canonicalId);
    if (!owner) errors.push(`${unit.sourcePath}: unit is not referenced by a work: ${unit.canonicalId}`);
    else if (owner !== unit.workCanonicalId) errors.push(`${unit.sourcePath}: invalid parent work ${unit.workCanonicalId}; expected ${owner}`);
    const work = works.find((candidate) => candidate.canonicalId === unit.workCanonicalId);
    const reference = work?.units.find((candidate) => candidate.canonicalId === unit.canonicalId);
    if (reference && reference.order !== unit.order) errors.push(`${unit.sourcePath}: unit order ${unit.order} does not match work order ${reference.order}`);
    if (unit.canonicalId === unit.workCanonicalId) errors.push(`${unit.sourcePath}: cyclic work/unit relationship ${unit.canonicalId}`);
  }

  for (const [canonicalId, localizedUnits] of unitsByCanonical) {
    const parents = new Set(localizedUnits.map((unit) => unit.workCanonicalId));
    const orders = new Set(localizedUnits.map((unit) => unit.order));
    if (parents.size > 1) errors.push(`cross-locale parent divergence for unit ${canonicalId}`);
    if (orders.size > 1) errors.push(`cross-locale order divergence for unit ${canonicalId}`);
    for (const locale of ["zh-CN", "en-US"]) if (!localizedUnits.some((unit) => unit.language === locale)) warnings.push(`${canonicalId}: translation missing for ${locale}`);
  }

  for (const work of works) for (const locale of ["zh-CN", "en-US"]) {
    if (!work.representations.some((representation) => representation.language === locale)) warnings.push(`${work.canonicalId}: translation missing for ${locale}`);
  }
  return {errors, warnings};
}

export class ContentWorkValidationError extends Error {
  constructor(public readonly errors: string[]) { super(`Content Work validation failed:\n${errors.join("\n")}`); }
}
