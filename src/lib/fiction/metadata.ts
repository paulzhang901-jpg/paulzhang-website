import type { Metadata } from "next";
import { siteUrl } from "@/lib/seo/metadata";
import { fictionPath, getFictionCoverPath } from "./repository";
import type { FictionEditorialRecord } from "@/types/fiction";

const landingDescription = "牧长客官方作品档案与文学作品发现入口。";

function absoluteFictionUrl(slug?: string, locale: "zh-CN" | "en-US" = "zh-CN") {
  return new URL(fictionPath(slug, locale), siteUrl).toString();
}

export function fictionLandingMetadata(locale: "zh-CN" | "en-US"): Metadata {
  const title = locale === "zh-CN" ? "牧长客 · 小说世界" : "Mu Changke Fiction";
  const canonical = absoluteFictionUrl(undefined, locale);
  return {
    title,
    description: landingDescription,
    alternates: {canonical, languages: {"zh-CN": absoluteFictionUrl(), "en-US": absoluteFictionUrl(undefined, "en-US")}},
    openGraph: {title, description: landingDescription, url: canonical, type: "website", locale},
  };
}

export function fictionWorkMetadata(work: FictionEditorialRecord, locale: "zh-CN" | "en-US"): Metadata {
  const description = work.editorialHook ?? work.rightsSafeIntroduction ?? undefined;
  const canonical = absoluteFictionUrl(work.slug, locale);
  const image = new URL(getFictionCoverPath(work), siteUrl);
  return {
    title: work.canonicalTitle,
    description,
    alternates: {canonical, languages: {"zh-CN": absoluteFictionUrl(work.slug), "en-US": absoluteFictionUrl(work.slug, "en-US")}},
    openGraph: {title: work.canonicalTitle, description, url: canonical, type: "article", locale, images: [{url: image, alt: `《${work.canonicalTitle}》封面`}]},
  };
}
