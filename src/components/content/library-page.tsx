import Link from "next/link";
import type { Route } from "next";
import { Container, ReadingContainer } from "@/components/layout/container";
import { Section, SectionHeading } from "@/components/layout/section";
import { libraryCopy, contentTopicLabel, contentTypeLabel, libraryTopicLabel } from "@/config/library";
import { getActiveLibraryCollections, getLibraryCollectionItems, getLibraryItems } from "@/lib/content/library";
import { contentPath } from "@/lib/content/paths";
import {ebooks, ebookPdfUrl, ebookCoverUrl} from "@/lib/content/ebooks";
import type { ContentRepository } from "@/lib/content/repository";
import type { ContentLanguage, NormalizedContentItem } from "@/types/content";
import {sameSermonDisplayText, sermonDisplayText} from "@/lib/sermons/display";

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

function FreeEbooks({locale}: {locale: ContentLanguage}) {
  const chinese = locale === "zh-CN";
  return <Section className="border-t bg-muted/30">
    <Container>
      <header className="mb-8 max-w-3xl">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-primary">{chinese ? "Free E-books" : "免费电子书"}</p>
        <h2 className="font-serif text-3xl leading-tight sm:text-4xl">{chinese ? "免费电子书" : "Free E-books"}</h2>
        <p className="mt-4 leading-7 text-muted-foreground">{chinese ? "《删不掉的光》系列 · 免费 PDF 电子书" : "The Light They Could Not Erase series · Free PDF e-books"}</p>
      </header>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {ebooks.map((book) => {
          const url = ebookPdfUrl(book.volume);
          return <article key={book.volume} className="flex h-full flex-col overflow-hidden rounded-lg border bg-surface">
            <div className="flex justify-center bg-muted/50 p-6">
              {/* Static public cover: keep this renderable in the Node route tests. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ebookCoverUrl(book.volume)} alt={chinese ? `${book.zhTitle}封面` : `Cover of ${book.enTitle}`} width={300} height={400} className="h-64 w-auto max-w-full object-contain shadow-sm sm:h-72" />
            </div>
            <div className="flex flex-1 flex-col p-6">
              <p className="text-sm font-semibold text-primary">{chinese ? `第 ${book.volume} 册` : `Volume ${book.volume}`}</p>
              <h3 className="mt-3 font-serif text-2xl leading-snug">{chinese ? book.zhTitle : book.enTitle}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{chinese ? book.enTitle : book.zhTitle}</p>
              <p className="mt-4 text-sm">{chinese ? "张崇助 / Chongzhu (Paul) Zhang" : "Chongzhu (Paul) Zhang / 张崇助"}</p>
              <p className="mt-4 flex-1 leading-7 text-muted-foreground">{chinese ? book.zhDescription : book.enDescription}</p>
              <a href={url} download className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 py-2 font-medium text-primary-foreground hover:opacity-90">{chinese ? "免费下载 PDF" : "Download PDF"}</a>
            </div>
          </article>;
        })}
      </div>
      <div className="mt-10 rounded-lg border bg-surface p-6 text-sm leading-7 text-muted-foreground sm:p-8">
        {chinese ? <>
          <p className="font-semibold text-foreground">免费下载 · 欢迎分享 · 非商业使用</p>
          <p className="mt-3">© 2026 张崇助 Chongzhu (Paul) Zhang。保留版权。</p>
          <p className="mt-3">本系列电子书可供个人阅读，也欢迎教会、团契、主日学及其他非营利事工免费使用、下载、分享和打印，但请保留作者姓名及出处。</p>
          <p className="mt-3">未经作者书面许可，不得用于商业出版、销售、付费课程、重新包装发行或其他商业用途。</p>
        </> : <>
          <p className="font-semibold text-foreground">Free download · Sharing welcome · Non-commercial use</p>
          <p className="mt-3">© 2026 Chongzhu (Paul) Zhang. All rights reserved.</p>
          <p className="mt-3">These e-books may be freely read and downloaded for personal use. Churches, fellowships, Sunday schools, and other nonprofit ministries may also use, share, and print them free of charge, provided that the author&apos;s name and source are retained.</p>
          <p className="mt-3">Commercial publication, sale, paid-course use, repackaging, redistribution for commercial purposes, or other commercial use requires prior written permission from the author.</p>
        </>}
      </div>
    </Container>
  </Section>;
}

function ResourceList({items, locale, repository}: {items: NormalizedContentItem[]; locale: ContentLanguage; repository: ContentRepository}) {
  const copy = libraryCopy[locale];
  if (!items.length) return <div className="rounded-lg border border-dashed p-8 text-muted-foreground">{copy.empty}</div>;
  return <div className="divide-y border-y">
    {items.map((item) => <article key={item.id} className="grid gap-5 py-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
      <div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span className="font-medium text-primary">{contentTypeLabel(locale, item.contentType, item.topics)}</span>
          {item.publishedAt ? <span>{copy.published} {formatDate(item.publishedAt, locale)}</span> : null}
          <span>{copy.availableIn}: {languageAvailability(item, repository)}</span>
        </div>
        <h2 className="mt-3 font-serif text-2xl leading-snug sm:text-3xl"><Link className="hover:underline" href={contentPath(item)}>{item.contentType === "sermon" ? sermonDisplayText(item.title, locale) : item.title}</Link></h2>
        {item.contentType !== "sermon" || !sameSermonDisplayText(item.subtitle ?? item.summary, item.title, locale) ? <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">{item.contentType === "sermon" ? sermonDisplayText(item.subtitle ?? item.summary, locale) : item.summary}</p> : null}
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
          {items.length ? <p className="text-sm text-muted-foreground">{items.length} {items.length === 1 ? copy.resourceSingular : copy.resource}</p> : null}
        </ReadingContainer>
      </Container>
    </Section>
    <FreeEbooks locale={locale} />
    {items.length ? <Section>
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
    </Section> : <Section>
      <Container><ReadingContainer className="px-0"><div className="border-y py-10 sm:py-12"><h2 className="font-serif text-3xl leading-tight">{copy.earlyTitle}</h2><p className="mt-5 text-lg leading-8 text-muted-foreground">{copy.earlyBody}</p></div></ReadingContainer></Container>
    </Section>}
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
