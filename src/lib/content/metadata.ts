import type { Metadata } from "next";
import { contentPath } from "./paths";
import { siteUrl } from "@/lib/seo/metadata";
import type { ContentRepository } from "./repository";
import type { NormalizedContentItem } from "@/types/content";

export function metadataForContent(item: NormalizedContentItem, repository: ContentRepository): Metadata {
  const zh = repository.resolveTranslation(item.canonicalId, "zh-CN", item);
  const en = repository.resolveTranslation(item.canonicalId, "en-US", item);
  const languages: Record<string, URL> = {};
  if (zh.status !== "missing" && zh.item.status === "published" && zh.item.visibility === "public" && zh.item.accessLevel === "public") languages["zh-CN"] = new URL(contentPath(zh.item), siteUrl);
  if (en.status !== "missing" && en.item.status === "published" && en.item.visibility === "public" && en.item.accessLevel === "public") languages["en-US"] = new URL(contentPath(en.item), siteUrl);
  return {
    title: item.seo.title ?? item.title,
    description: item.seo.description ?? item.summary,
    alternates: {canonical: new URL(contentPath(item), siteUrl), languages},
    openGraph: {title: item.seo.title ?? item.title, description: item.seo.description ?? item.summary, locale: item.language},
  };
}
