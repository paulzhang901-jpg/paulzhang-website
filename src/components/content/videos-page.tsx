import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Section, SectionHeading } from "@/components/layout/section";
import { VideosSection } from "./videos-section";
import { getPublishedVideos } from "@/lib/content/published-videos";
import { localizedPath } from "@/lib/i18n/routing";
import type { ContentRepository } from "@/lib/content/repository";
import type { ContentLanguage } from "@/types/content";

export function VideosPage({locale, repository}: {locale: ContentLanguage; repository: ContentRepository}) {
  const zh = locale === "zh-CN";
  return <>
    <Section className="border-b bg-muted/40"><Container>
      <nav aria-label={zh ? "面包屑" : "Breadcrumbs"} className="mb-6 text-sm text-muted-foreground">
        <Link href={localizedPath("home", locale)}>{zh ? "首页" : "Home"}</Link>
        <span aria-hidden="true" className="mx-2">/</span>
        <span aria-current="page">{zh ? "视频讲堂" : "Videos"}</span>
      </nav>
      <SectionHeading title={zh ? "视频讲堂" : "Videos"}>
        <p>{zh ? "通过视频思想圣经真理，也可阅读相关原文、收听音频，在生活中继续学习与实践。" : "Explore biblical truth through video, related reading, and audio, with room to reflect and put faith into practice."}</p>
      </SectionHeading>
      <Link href={localizedPath("library", locale)} className="inline-flex min-h-11 items-center text-primary underline">{zh ? "浏览真理资源库" : "Explore the Truth Library"}</Link>
    </Container></Section>
    <VideosSection locale={locale} items={getPublishedVideos(repository, locale)} />
  </>;
}
