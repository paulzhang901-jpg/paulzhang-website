import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { FictionDiscovery } from "./fiction-discovery";
import { fictionPath, getFictionCardRecords } from "@/lib/fiction/repository";

export function FictionLandingPage({locale}: {locale: "zh-CN" | "en-US"}) {
  const works = getFictionCardRecords();
  const featured = works[0];
  const copy = locale === "zh-CN"
    ? {eyebrow: "作者官方作品档案", title: "牧长客 · 小说世界", subtitle: "Mu Changke Fiction", lead: "小说，是另一种寻找人的方式。", explore: "探索全部作品", featured: "旗舰作品", featuredCta: "进入作品档案", boundaryTitle: "作品发现，而非全文阅读", boundary: "这里是作者作品档案与官方阅读指引入口，不提供小说正文、章节连载或下载。正式阅读与发行以授权平台为准。"}
    : {eyebrow: "Author Portfolio · Editorial Discovery Layer", title: "Mu Changke Fiction", subtitle: "牧长客 · 小说世界", lead: "小说，是另一种寻找人的方式。", explore: "Explore all works", featured: "Featured work", featuredCta: "View work profile", boundaryTitle: "Discovery, not full-text distribution", boundary: "This is the author’s official work archive and reading guide. It does not provide full manuscripts, serialized chapters, or downloads. Literary editorial content remains in its approved Chinese source language."};

  return <>
    <section className="relative overflow-hidden border-b bg-[#18251f] text-[#f7f0df]">
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(181,128,74,0.22),transparent_38%)]" />
      <Container className="relative grid min-h-[34rem] items-center gap-10 py-16 lg:grid-cols-[1.08fr_0.72fr] lg:py-20">
        <div className="max-w-3xl"><p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#d4b27f]">{copy.eyebrow}</p><h1 className="mt-5 font-serif text-5xl leading-[1.08] sm:text-6xl lg:text-7xl">{copy.title}</h1><p className="mt-4 text-lg tracking-[0.12em] text-[#d9d3c7]">{copy.subtitle}</p><p className="mt-8 max-w-xl font-serif text-2xl leading-relaxed text-[#eee4d2] sm:text-3xl">{copy.lead}</p><a href="#all-works" className="mt-9 inline-flex min-h-12 items-center rounded-full border border-[#d4b27f]/60 px-6 font-medium text-[#f7f0df] hover:bg-white/10">{copy.explore}<span className="ml-2" aria-hidden="true">↓</span></a></div>
        <div className="relative mx-auto w-full max-w-sm"><div className="absolute -inset-5 rounded-[2rem] border border-[#d4b27f]/20" /><div className="relative aspect-[2/3] overflow-hidden rounded-[1.2rem] bg-black/20 shadow-2xl"><Image src={featured.cover} alt={`《${featured.canonicalTitle}》封面`} fill priority sizes="(min-width: 1024px) 30vw, 70vw" className="object-contain" /></div></div>
      </Container>
    </section>
    <section className="border-b bg-muted/45 py-[var(--space-section)]">
      <Container className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-center"><div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">{copy.featured}</p><h2 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">《{featured.canonicalTitle}》</h2><p className="mt-5 text-lg leading-8 text-muted-foreground">{featured.editorialHook}</p><Link href={fictionPath(featured.slug, locale)} className="mt-7 inline-flex min-h-12 items-center rounded-full bg-primary px-6 font-medium text-primary-foreground">{copy.featuredCta}<span className="ml-2" aria-hidden="true">→</span></Link></div><div className="rounded-[1.25rem] border bg-surface p-7 shadow-[var(--shadow-soft)]"><h2 className="font-serif text-2xl">{copy.boundaryTitle}</h2><p className="mt-4 leading-8 text-muted-foreground">{copy.boundary}</p></div></Container>
    </section>
    <Container><FictionDiscovery works={works} locale={locale} /></Container>
  </>;
}
