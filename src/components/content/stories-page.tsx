import Link from "next/link";
import type {Route} from "next";
import {Container, ReadingContainer} from "@/components/layout/container";
import {Section, SectionHeading} from "@/components/layout/section";
import {getMessages} from "@/config/i18n";
import {contentPath} from "@/lib/content/paths";
import type {ContentRepository} from "@/lib/content/repository";
import {workPath} from "@/lib/content/works/routing";
import type {ContentWorkRepository} from "@/lib/content/works/repository";
import type {ContentLanguage} from "@/types/content";
import {getMyStoryCollections, getStoryItems} from "@/lib/content/stories";
import {myStoryTopicLabel} from "@/lib/content/story-topics";

export function StoriesPage({locale, contentRepository, workRepository}: {
  locale: ContentLanguage;
  contentRepository: ContentRepository;
  workRepository: ContentWorkRepository;
}) {
  const copy = getMessages(locale);
  const works = workRepository.getPublishedWorks(locale);
  const stories = getStoryItems(contentRepository, locale);
  const categories = getMyStoryCollections();
  const hasContent = works.length > 0 || stories.length > 0;

  return <>
    <Section className="border-b bg-muted/40">
      <Container><ReadingContainer className="px-0">
        <SectionHeading eyebrow={locale === "zh-CN" ? "真实生命见证" : "True life testimonies"} title={copy.stories}>
          <p>{locale === "zh-CN" ? "从真实的生命故事中，看见爱、失去、恩典与盼望。" : "Encounter stories of love, loss, grace, and hope through real lives."}</p>
        </SectionHeading>
      </ReadingContainer></Container>
    </Section>
    <Section>
      <Container><ReadingContainer className="px-0">
        <nav aria-label={locale === "zh-CN" ? "生命故事分类" : "My Story categories"} className="mb-10 flex flex-wrap gap-2">
          {categories.map((category) => <Link key={category} href={`${locale === "en-US" ? "/en" : ""}/stories/${category}` as Route} className="rounded-full border bg-surface px-4 py-2 text-sm hover:bg-muted">{myStoryTopicLabel(locale, category)}</Link>)}
        </nav>
        {!hasContent ? <p className="rounded-lg border border-dashed p-8 text-muted-foreground">{copy.foundationNote}</p> : <div className="space-y-6">
          {works.map(({work, representation}) => <article key={`${work.canonicalId}:${representation.language}`} className="rounded-[var(--radius-lg)] border bg-surface p-6 shadow-[var(--shadow-soft)] sm:p-8">
            <p className="text-sm font-semibold text-primary">{work.canonicalId === "work-little-wheat-v1" ? (locale === "zh-CN" ? "小麦子生命故事" : "Little Wheat Life Story") : (locale === "zh-CN" ? "完整作品" : "Complete work")}</p>
            <h2 className="mt-3 font-serif text-3xl leading-tight sm:text-4xl"><Link className="hover:underline" href={workPath(representation.slug, locale) as Route}>{representation.title}</Link></h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">{representation.summary}</p>
            <Link href={workPath(representation.slug, locale) as Route} className="mt-6 inline-flex min-h-11 items-center font-medium text-primary underline underline-offset-4">{locale === "zh-CN" ? "进入《麦子落地》" : "Open the work"} →</Link>
          </article>)}
          {stories.map((item) => <article key={item.id} className="rounded-[var(--radius-lg)] border bg-surface p-6 shadow-[var(--shadow-soft)] sm:p-8">
            <p className="text-sm font-semibold text-primary">{locale === "zh-CN" ? "生命故事" : "Life story"}</p>
            <h2 className="mt-3 font-serif text-3xl leading-tight"><Link className="hover:underline" href={contentPath(item)}>{item.title}</Link></h2>
            <p className="mt-4 leading-7 text-muted-foreground">{item.summary}</p>
          </article>)}
        </div>}
      </ReadingContainer></Container>
    </Section>
  </>;
}
