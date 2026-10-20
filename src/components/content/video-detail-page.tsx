import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { Section, SectionHeading } from "@/components/layout/section";
import { VideosSection } from "./videos-section";
import { getPublishedVideos, videoDetailPath } from "@/lib/content/published-videos";
import { localizedPath } from "@/lib/i18n/routing";
import { siteUrl } from "@/lib/seo/metadata";
import type { ContentRepository } from "@/lib/content/repository";
import type { ContentLanguage } from "@/types/content";

export function resolveVideoDetail(slug: string, locale: ContentLanguage, repository: ContentRepository) {
  return getPublishedVideos(repository, locale).find(video => video.detail === videoDetailPath(slug, locale));
}
export function videoStaticParams(locale: ContentLanguage, repository: ContentRepository) {
  const videos = getPublishedVideos(repository, locale);
  return videos.length ? videos.map(video => ({slug: video.detail!.split("/").at(-1)!})) : [{slug: "__static-export-placeholder__"}];
}
export function videoMetadata(slug: string, locale: ContentLanguage, repository: ContentRepository): Metadata {
  const video = resolveVideoDetail(slug, locale, repository);
  if (!video?.detail) return {};
  const languages: Record<string, string> = {};
  for (const language of ["zh-CN", "en-US"] as const) {
    const counterpart = getPublishedVideos(repository, language).find(entry => entry.canonicalId === video.canonicalId);
    if (counterpart?.detail) languages[language] = new URL(counterpart.detail, siteUrl).toString();
  }
  return {title: video.title, alternates: {canonical: new URL(video.detail, siteUrl).toString(), languages}, openGraph: {title: video.title, locale}};
}
export function VideoDetailPage({slug, locale, repository}: {slug: string; locale: ContentLanguage; repository: ContentRepository}) {
  const video = resolveVideoDetail(slug, locale, repository);
  if (!video) return null;
  const alternate = getPublishedVideos(repository, locale === "zh-CN" ? "en-US" : "zh-CN").find(entry => entry.canonicalId === video.canonicalId);
  return <>
    <Section className="border-b bg-muted/40"><Container>
      <nav aria-label={locale === "zh-CN" ? "面包屑" : "Breadcrumbs"} className="mb-6"><Link href={localizedPath("videos", locale)}>{locale === "zh-CN" ? "视频讲堂" : "Videos"}</Link></nav>
      <SectionHeading title={video.title} />
      {alternate?.detail ? <a data-language-alternate href={alternate.detail} hrefLang={alternate.locale} className="inline-flex min-h-11 items-center text-primary underline">{locale === "zh-CN" ? "English video" : "中文视频"}</a> : null}
    </Container></Section>
    <VideosSection locale={locale} items={[video]} showDetails={false} />
  </>;
}
