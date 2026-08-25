import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Container, ReadingContainer } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { TopicBadge } from "@/components/content/content-foundation";
import { ScriptureBlock, ReflectionBlock, PracticeBlock, PrayerBlock, NextStepCTA } from "@/components/formation/formation-blocks";
import { contentTopicLabel, contentTypeLabel, libraryCopy } from "@/config/library";
import { contentPath } from "@/lib/content/paths";
import type { ContentRepository } from "@/lib/content/repository";
import type { ContentLanguage, NormalizedContentItem } from "@/types/content";

function RelatedContent({children}: {children: ReactNode}) {
  return <aside className="my-8 border-l-4 border-l-[var(--color-truth)] bg-surface p-6"><h2 className="font-serif text-xl">Related content</h2><div className="mt-3 leading-7 text-muted-foreground">{children}</div></aside>;
}

const mdxComponents = {ScriptureBlock, ReflectionBlock, PracticeBlock, PrayerBlock, RelatedContent, NextStepCTA};

function TranslationStatus({item, repository}: {item: NormalizedContentItem; repository: ContentRepository}) {
  const copy = libraryCopy[item.language];
  const targetLocale: ContentLanguage = item.language === "zh-CN" ? "en-US" : "zh-CN";
  const translation = repository.resolvePublicTranslation(item.canonicalId, targetLocale, item);
  if (!translation.available) {
    return <p data-translation-unavailable className="mt-5 text-sm text-muted-foreground">
      {item.language === "zh-CN" ? copy.translationMissing : "A Chinese translation is not currently available."}
    </p>;
  }
  return <div className="mt-5 text-sm"><Link data-language-alternate href={contentPath(translation.item)} hrefLang={targetLocale} className="font-medium underline underline-offset-4">
    {copy.readEnglish}
  </Link>{translation.status === "outdated" ? <span className="ml-3 text-muted-foreground">{copy.translationOutdated}</span> : null}</div>;
}

function contentIndexPath(item: NormalizedContentItem) {
  const domain = item.domain === "stories" ? "stories" : "library";
  return `${item.language === "en-US" ? "/en" : ""}/${domain}` as Route;
}
function companionshipPath(locale: ContentLanguage) { return `${locale === "en-US" ? "/en" : ""}/together` as Route; }

function formatScripture(reference: NormalizedContentItem["scriptureRefs"][number]) {
  const start = `${reference.book} ${reference.chapterStart}${reference.verseStart ? `:${reference.verseStart}` : ""}`;
  if (!reference.chapterEnd) return start;
  const end = reference.chapterEnd === reference.chapterStart && reference.verseEnd ? reference.verseEnd : `${reference.chapterEnd}${reference.verseEnd ? `:${reference.verseEnd}` : ""}`;
  return `${start}–${end}`;
}

export async function ContentPage({item, repository}: {item: NormalizedContentItem; repository: ContentRepository}) {
  const copy = libraryCopy[item.language];
  const isStory = item.domain === "stories";
  const related = repository.getRelatedContent(item, 3);
  return <>
    <Section className="border-b bg-muted/40">
      <Container>
        <ReadingContainer className="px-0">
          <nav aria-label={item.language === "zh-CN" ? "面包屑" : "Breadcrumbs"} className="mb-8 text-sm text-muted-foreground"><Link href={contentIndexPath(item)}>{isStory ? copy.backStories : copy.back}</Link></nav>
        <article>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <span className="font-semibold text-primary">{contentTypeLabel(item.language, item.contentType)}</span>
            <span>{copy.published} {item.publishedAt.toLocaleDateString(item.language)}</span>
            {item.updatedAt && item.updatedAt.getTime() !== item.publishedAt.getTime() ? <span>{copy.updated} {item.updatedAt.toLocaleDateString(item.language)}</span> : null}
          </div>
          <h1 className="mt-3 font-serif text-4xl leading-tight md:text-5xl">{item.title}</h1>
          {item.subtitle ? <p className="mt-3 text-xl text-muted-foreground">{item.subtitle}</p> : null}
          <p className="mt-5 text-lg leading-8 text-muted-foreground">{item.summary}</p>
          {item.authors.length ? <p className="mt-5 text-sm text-muted-foreground">{copy.by} {item.authors.join(", ")}</p> : null}
          <div className="mt-5 flex flex-wrap gap-2">{item.topics.map((topic) => <TopicBadge key={topic}>{contentTopicLabel(item.language, topic)}</TopicBadge>)}</div>
          {item.scriptureRefs.length ? <div className="mt-5 text-sm text-muted-foreground"><span className="font-medium text-foreground">{copy.scripture}: </span>{item.scriptureRefs.map(formatScripture).join("; ")}</div> : null}
          <TranslationStatus item={item} repository={repository} />
        </article>
        </ReadingContainer>
      </Container>
    </Section>
    <Section>
      <Container><ReadingContainer className="px-0"><article className="prose-content"><MDXRemote source={item.body} components={mdxComponents} /></article></ReadingContainer></Container>
    </Section>
    <Section className="border-t bg-muted/40">
      <Container>
        <ReadingContainer className="px-0">
          {related.length ? <aside><h2 className="font-serif text-3xl">{copy.related}</h2><p className="mt-3 leading-7 text-muted-foreground">{copy.relatedBody}</p><ul className="mt-6 divide-y border-y">{related.map((entry) => <li key={entry.id} className="py-5"><Link className="font-serif text-xl hover:underline" href={contentPath(entry)}>{entry.title}</Link><p className="mt-2 leading-7 text-muted-foreground">{entry.summary}</p></li>)}</ul></aside> : null}
          <aside className={related.length ? "mt-12 border-t pt-8" : ""}><h2 className="font-serif text-2xl">{copy.nextTitle}</h2><p className="mt-3 leading-7 text-muted-foreground">{isStory ? copy.nextBodyStories : copy.nextBody}</p><div className="mt-5 flex flex-col gap-3 sm:flex-row"><Link className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 font-medium text-primary-foreground" href={contentIndexPath(item)}>{isStory ? copy.exploreStories : copy.explore}</Link><Link className="inline-flex min-h-11 items-center justify-center rounded-md border bg-surface px-5 font-medium" href={companionshipPath(item.language)}>{copy.companionship}</Link></div></aside>
        </ReadingContainer>
      </Container>
    </Section>
  </>;
}
