import Link from "next/link";
import type { ReactNode } from "react";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Container, ReadingContainer } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { ContentMeta, TopicBadge } from "@/components/content/content-foundation";
import { ScriptureBlock, ReflectionBlock, PracticeBlock, PrayerBlock, NextStepCTA } from "@/components/formation/formation-blocks";
import { contentPath } from "@/lib/content/paths";
import type { ContentRepository } from "@/lib/content/repository";
import type { ContentLanguage, NormalizedContentItem } from "@/types/content";

function RelatedContent({children}: {children: ReactNode}) {
  return <aside className="my-8 rounded-lg border bg-surface p-6"><h2 className="font-serif text-xl">Related content</h2><div className="mt-3 leading-7 text-muted-foreground">{children}</div></aside>;
}

const mdxComponents = {ScriptureBlock, ReflectionBlock, PracticeBlock, PrayerBlock, RelatedContent, NextStepCTA};

function TranslationStatus({item, repository}: {item: NormalizedContentItem; repository: ContentRepository}) {
  const targetLocale: ContentLanguage = item.language === "zh-CN" ? "en-US" : "zh-CN";
  const translation = repository.resolvePublicTranslation(item.canonicalId, targetLocale, item);
  if (!translation.available) {
    return <p data-translation-unavailable className="mt-5 text-sm text-muted-foreground">
      {item.language === "zh-CN" ? "此内容暂时没有可用的英文译本。" : "A Chinese translation is not currently available."}
    </p>;
  }
  return <div className="mt-5 text-sm"><Link data-language-alternate href={contentPath(translation.item)} hrefLang={targetLocale} className="font-medium underline underline-offset-4">
    {item.language === "zh-CN" ? "阅读英文译本" : "阅读中文译本"}
  </Link>{translation.status === "outdated" ? <span className="ml-3 text-muted-foreground">{item.language === "zh-CN" ? "译本可能需要更新" : "Translation may need updating"}</span> : null}</div>;
}

export async function ContentPage({item, repository}: {item: NormalizedContentItem; repository: ContentRepository}) {
  const related = repository.getRelatedContent(item, 3);
  return <Section>
    <Container>
      <ReadingContainer className="px-0">
        <article>
          <ContentMeta>{item.contentType} · {item.publishedAt.toLocaleDateString(item.language)}</ContentMeta>
          <h1 className="mt-3 font-serif text-4xl leading-tight md:text-5xl">{item.title}</h1>
          {item.subtitle ? <p className="mt-3 text-xl text-muted-foreground">{item.subtitle}</p> : null}
          <p className="mt-5 text-lg leading-8 text-muted-foreground">{item.summary}</p>
          <div className="mt-5 flex flex-wrap gap-2">{item.topics.map((topic) => <TopicBadge key={topic}>{topic}</TopicBadge>)}</div>
          <TranslationStatus item={item} repository={repository} />
          <div className="prose-content mt-10 leading-8"><MDXRemote source={item.body} components={mdxComponents} /></div>
        </article>
        {related.length ? <aside className="mt-12 border-t pt-8"><h2 className="font-serif text-2xl">{item.language === "zh-CN" ? "相关内容" : "Related content"}</h2><ul className="mt-4 space-y-3">{related.map((entry) => <li key={entry.id}><Link className="underline underline-offset-4" href={contentPath(entry)}>{entry.title}</Link></li>)}</ul></aside> : null}
      </ReadingContainer>
    </Container>
  </Section>;
}
