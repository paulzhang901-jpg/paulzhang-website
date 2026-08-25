import Link from "next/link";
import type { Route } from "next";
import { Container, ReadingContainer } from "@/components/layout/container";
import { Section, SectionHeading } from "@/components/layout/section";
import { libraryCopy, contentTopicLabel, contentTypeLabel, libraryTopicLabel } from "@/config/library";
import { getActiveLibraryCollections, getLibraryCollectionItems, getLibraryItems } from "@/lib/content/library";
import { contentPath } from "@/lib/content/paths";
import type { ContentRepository } from "@/lib/content/repository";
import type { ContentLanguage, NormalizedContentItem } from "@/types/content";

function libraryPath(locale: ContentLanguage, child?: string) {
  return `${locale === "en-US" ? "/en" : ""}/library${child ? `/${child}` : ""}` as Route;
}

function formatDate(value: Date, locale: ContentLanguage) {
  return new Intl.DateTimeFormat(locale, {year: "numeric", month: "short", day: "numeric"}).format(value);
}

function languageAvailability(item: NormalizedContentItem, repository: ContentRepository) {
  const other = repository.resolvePublicTranslation(item.canonicalId, item.language === "zh-CN" ? "en-US" : "zh-CN", item);
  return other.available ? "中文 · English" : item.language === "zh-CN" ? "中文" : "English";
}

function ResourceList({items, locale, repository}: {items: NormalizedContentItem[]; locale: ContentLanguage; repository: ContentRepository}) {
  const copy = libraryCopy[locale];
  if (!items.length) return <div className="rounded-lg border border-dashed p-8 text-muted-foreground">{copy.empty}</div>;
  return <div className="divide-y border-y">
    {items.map((item) => <article key={item.id} className="grid gap-5 py-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
      <div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span className="font-medium text-primary">{contentTypeLabel(locale, item.contentType)}</span>
          <span>{copy.published} {formatDate(item.publishedAt, locale)}</span>
          <span>{copy.availableIn}: {languageAvailability(item, repository)}</span>
        </div>
        <h2 className="mt-3 font-serif text-2xl leading-snug sm:text-3xl"><Link className="hover:underline" href={contentPath(item)}>{item.title}</Link></h2>
        <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">{item.summary}</p>
        <div className="mt-4 flex flex-wrap gap-2">{item.topics.slice(0, 3).map((topic) => <span key={topic} className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">{contentTopicLabel(locale, topic)}</span>)}</div>
      </div>
      <Link href={contentPath(item)} className="inline-flex min-h-11 items-center font-medium text-primary underline decoration-transparent underline-offset-4 hover:decoration-current">{copy.read} →</Link>
    </article>)}
  </div>;
}

export async function LibraryPage({locale, repository}: {locale: ContentLanguage; repository: ContentRepository}) {
  const copy = libraryCopy[locale];
  const items = getLibraryItems(repository, locale);
  const topics = getActiveLibraryCollections(items);
  return <>
    <Section className="border-b bg-muted/50">
      <Container>
        <nav aria-label={locale === "zh-CN" ? "面包屑" : "Breadcrumbs"} className="mb-6 text-sm text-muted-foreground">
          <Link href={(locale === "zh-CN" ? "/" : "/en") as Route}>{copy.home}</Link><span aria-hidden="true" className="mx-2">/</span><span aria-current="page">{copy.eyebrow}</span>
        </nav>
        <ReadingContainer className="mx-0 px-0">
          <SectionHeading eyebrow={copy.eyebrow} title={copy.title}><p>{copy.introduction}</p></SectionHeading>
          <p className="text-sm text-muted-foreground">{items.length} {items.length === 1 ? copy.resourceSingular : copy.resource}</p>
        </ReadingContainer>
      </Container>
    </Section>
    <Section>
      <Container>
        <div className="grid gap-10 lg:grid-cols-[17rem_minmax(0,1fr)]">
          <aside aria-labelledby="library-topics">
            <h2 id="library-topics" className="font-serif text-2xl">{copy.browseTitle}</h2>
            <p className="mt-3 leading-7 text-muted-foreground">{copy.browseBody}</p>
            <nav aria-label={copy.browseTitle} className="mt-6 flex flex-wrap gap-2 lg:flex-col lg:items-start">
              {topics.map((topic) => <Link key={topic} href={libraryPath(locale, topic)} className="rounded-full border bg-surface px-4 py-2 text-sm hover:bg-muted lg:w-full lg:rounded-md">{libraryTopicLabel(locale, topic)}</Link>)}
            </nav>
          </aside>
          <div>
            <h2 className="font-serif text-3xl">{copy.resourcesTitle}</h2>
            <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">{copy.resourcesBody}</p>
            <div className="mt-8"><ResourceList items={items} locale={locale} repository={repository} /></div>
          </div>
        </div>
      </Container>
    </Section>
  </>;
}

export async function LibraryCollectionPage({locale, collection, repository}: {locale: ContentLanguage; collection: string; repository: ContentRepository}) {
  const copy = libraryCopy[locale];
  const items = getLibraryCollectionItems(repository, locale, collection);
  return <Section>
    <Container>
      <nav aria-label={locale === "zh-CN" ? "面包屑" : "Breadcrumbs"} className="mb-6 text-sm text-muted-foreground">
        <Link href={libraryPath(locale)}>{copy.back}</Link><span aria-hidden="true" className="mx-2">/</span><span aria-current="page">{libraryTopicLabel(locale, collection)}</span>
      </nav>
      <SectionHeading eyebrow={copy.eyebrow} title={libraryTopicLabel(locale, collection)}><p>{copy.browseBody}</p></SectionHeading>
      <ResourceList items={items} locale={locale} repository={repository} />
    </Container>
  </Section>;
}
