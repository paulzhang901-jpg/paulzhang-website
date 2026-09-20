import Link from "next/link";
import {Container} from "@/components/layout/container";
import {Section, SectionHeading} from "@/components/layout/section";
import {contentPath} from "@/lib/content/paths";
import type {ContentRepository} from "@/lib/content/repository";
import {getStoryCollectionItems} from "@/lib/content/stories";
import {myStoryTopicLabel} from "@/lib/content/story-topics";
import type {ContentLanguage} from "@/types/content";

export function StoryCollectionPage({locale, collection, repository}: {locale: ContentLanguage; collection: string; repository: ContentRepository}) {
  const items=getStoryCollectionItems(repository, locale, collection);
  return <Section><Container>
    <nav className="mb-6 text-sm text-muted-foreground"><Link href={locale === "zh-CN" ? "/stories" : "/en/stories"}>{locale === "zh-CN" ? "返回生命故事" : "Back to My Story"}</Link></nav>
    <SectionHeading eyebrow={locale === "zh-CN" ? "生命故事" : "My Story"} title={myStoryTopicLabel(locale, collection)} />
    <div className="mt-8 space-y-6">{items.length ? items.map((item)=><article key={item.id} className="rounded-[var(--radius-lg)] border bg-surface p-6"><h2 className="font-serif text-2xl"><Link href={contentPath(item)}>{item.title}</Link></h2><p className="mt-3 leading-7 text-muted-foreground">{item.summary}</p></article>) : <p className="text-muted-foreground">{locale === "zh-CN" ? "这个分类目前还没有已公开的故事。" : "No published stories are currently available in this category."}</p>}</div>
  </Container></Section>;
}
