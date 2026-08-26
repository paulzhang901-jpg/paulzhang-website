import type { Metadata } from "next";
import { siteUrl } from "@/lib/seo/metadata";
import { unitPath, workPath } from "./routing";
import type { ContentWorkRepository } from "./repository";
import type { ContentUnit, ContentWork, PublicWorkRepresentation } from "@/types/content-work";

export function metadataForWork(work: ContentWork, representation: PublicWorkRepresentation, repository: ContentWorkRepository): Metadata {
  const zh = repository.resolvePublicWorkTranslation(work.canonicalId, "zh-CN", representation);
  const en = repository.resolvePublicWorkTranslation(work.canonicalId, "en-US", representation);
  const languages: Record<string, URL> = {};
  if (zh.available) languages["zh-CN"] = new URL(workPath(zh.representation.slug, "zh-CN"), siteUrl);
  if (en.available) languages["en-US"] = new URL(workPath(en.representation.slug, "en-US"), siteUrl);
  return {title: representation.seo.title ?? representation.title, description: representation.seo.description ?? representation.summary, alternates: {canonical: new URL(workPath(representation.slug, representation.language), siteUrl), languages}};
}

export function metadataForUnit(work: ContentWork, workRepresentation: PublicWorkRepresentation, unit: ContentUnit, repository: ContentWorkRepository): Metadata {
  const zh = repository.resolvePublicUnitTranslation(unit.canonicalId, "zh-CN", unit);
  const en = repository.resolvePublicUnitTranslation(unit.canonicalId, "en-US", unit);
  const languages: Record<string, URL> = {};
  if (zh.available) languages["zh-CN"] = new URL(unitPath(zh.workRepresentation.slug, zh.unit.slug, "zh-CN"), siteUrl);
  if (en.available) languages["en-US"] = new URL(unitPath(en.workRepresentation.slug, en.unit.slug, "en-US"), siteUrl);
  return {title: unit.seo.title ?? unit.title, alternates: {canonical: new URL(unitPath(workRepresentation.slug, unit.slug, unit.language), siteUrl), languages}, description: work.representations.find((representation) => representation.language === unit.language)?.summary};
}
