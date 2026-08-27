import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Container, ReadingContainer } from "@/components/layout/container";
import { fictionPath, getFictionCoverPath } from "@/lib/fiction/repository";
import type { FictionEditorialRecord } from "@/types/fiction";

function RichText({text}: {text: string}) {
  const pieces = text.split(/(\*\*[^*]+\*\*)/g);
  return <>{pieces.map((piece, index) => piece.startsWith("**") && piece.endsWith("**") ? <strong key={index}>{piece.slice(2, -2)}</strong> : piece)}</>;
}

function TextSection({title, text}: {title: string; text: string | null}) {
  if (!text) return null;
  return <section className="border-t pt-10"><h2 className="font-serif text-3xl">{title}</h2><div className="mt-5 space-y-5 text-[1.0625rem] leading-9 text-foreground/90">{text.split(/\n\s*\n/).map((paragraph, index) => <p key={index} className="whitespace-pre-line"><RichText text={paragraph} /></p>)}</div></section>;
}

function StructuredData({work, locale}: {work: FictionEditorialRecord; locale: "zh-CN" | "en-US"}) {
  const value = {"@context": "https://schema.org", "@type": "CreativeWork", name: work.canonicalTitle, author: {"@type": "Person", name: "牧长客"}, description: work.editorialHook, image: getFictionCoverPath(work), url: fictionPath(work.slug, locale), inLanguage: "zh-CN"};
  return <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(value).replace(/</g, "\\u003c")}} />;
}

export function FictionWorkPage({work, locale}: {work: FictionEditorialRecord; locale: "zh-CN" | "en-US"}) {
  const labels = locale === "zh-CN"
    ? {back: "返回小说世界", author: "作者：牧长客", themes: "主题", intro: "作品介绍", why: "为什么值得读", experience: "阅读体验", note: "圣经与文化说明", vision: "作者创作说明", publication: "出版与阅读说明", cta: "官方阅读指引", boundary: "本页不提供小说正文、章节连载或下载。"}
    : {back: "Back to Mu Changke Fiction", author: "Author: 牧长客", themes: "Themes", intro: "About this work", why: "Why read it", experience: "Reading experience", note: "Biblical and cultural note", vision: "Author creative vision", publication: "Publication note", cta: "Official reading guidance", boundary: "This page does not provide full manuscripts, serialized chapters, or downloads."};
  const experienceItems = work.readingExperience?.split("\n").filter(Boolean) ?? [];
  const sections: ReactNode[] = [];
  sections.push(<TextSection key="intro" title={labels.intro} text={work.rightsSafeIntroduction} />);
  sections.push(<TextSection key="why" title={labels.why} text={work.whyRead} />);
  if (experienceItems.length) sections.push(<section key="experience" className="border-t pt-10"><h2 className="font-serif text-3xl">{labels.experience}</h2><ul className="mt-5 space-y-3 pl-5 text-[1.0625rem] leading-8">{experienceItems.map((item) => <li key={item} className="list-disc">{item}</li>)}</ul></section>);
  sections.push(<TextSection key="note" title={labels.note} text={work.biblicalCulturalNote} />);
  sections.push(<TextSection key="vision" title={labels.vision} text={work.authorCreativeNote} />);
  sections.push(<TextSection key="publication" title={labels.publication} text={work.publicationNote} />);

  return <>
    <StructuredData work={work} locale={locale} />
    <section className="border-b bg-[#18251f] text-[#f7f0df]">
      <Container className="grid gap-10 py-12 md:grid-cols-[minmax(15rem,0.65fr)_1.35fr] md:items-center lg:py-16">
        <div className="relative mx-auto aspect-[2/3] w-full max-w-sm overflow-hidden rounded-[1.1rem] bg-black/20 shadow-2xl"><Image src={getFictionCoverPath(work)} alt={`《${work.canonicalTitle}》封面`} fill priority sizes="(min-width: 768px) 34vw, 80vw" className="object-contain" /></div>
        <div><Link href={fictionPath(undefined, locale)} className="inline-flex min-h-11 items-center text-sm text-[#d4b27f] hover:underline">← {labels.back}</Link><p className="mt-6 text-sm uppercase tracking-[0.2em] text-[#d4b27f]">Mu Changke Fiction</p><h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl lg:text-6xl">《{work.canonicalTitle}》</h1><p className="mt-4 text-[#d9d3c7]">{labels.author}</p>{work.editorialHook ? <p className="mt-8 max-w-3xl font-serif text-xl leading-9 text-[#eee4d2] sm:text-2xl"><RichText text={work.editorialHook} /></p> : null}{work.themes.length ? <div className="mt-7"><h2 className="sr-only">{labels.themes}</h2><ul className="flex flex-wrap gap-2">{work.themes.map((theme) => <li key={theme} className="rounded-full border border-white/20 px-3 py-1 text-sm text-[#e6ddcf]">{theme}</li>)}</ul></div> : null}</div>
      </Container>
    </section>
    <ReadingContainer className="space-y-12 py-[var(--space-section)]">
      {sections}
      <aside aria-labelledby="fiction-cta-heading" className="rounded-[1.1rem] border border-primary/25 bg-muted p-7 sm:p-9"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Search guidance</p><h2 id="fiction-cta-heading" className="mt-2 font-serif text-3xl">{labels.cta}</h2><div className="mt-5 space-y-4 whitespace-pre-line text-[1.0625rem] leading-8"><RichText text={work.officialReadingCTA} /></div><p className="mt-6 border-t pt-5 text-sm leading-6 text-muted-foreground">{labels.boundary}</p></aside>
    </ReadingContainer>
  </>;
}
