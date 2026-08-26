import Link from "next/link";
import type { Route } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Container, ReadingContainer } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { unitPath, workPath } from "@/lib/content/works/routing";
import type { ContentWorkRepository } from "@/lib/content/works/repository";
import type { ContentUnit, ContentWork, PublicWorkRepresentation } from "@/types/content-work";

function AlternateWork({work, representation, repository}: {work: ContentWork; representation: PublicWorkRepresentation; repository: ContentWorkRepository}) {
  const targetLocale = representation.language === "zh-CN" ? "en-US" : "zh-CN";
  const alternate = repository.resolvePublicWorkTranslation(work.canonicalId, targetLocale, representation);
  if (!alternate.available) return <p data-translation-unavailable className="mt-5 text-sm text-muted-foreground">{representation.language === "zh-CN" ? "英文版本尚未发布。" : "A Chinese edition is not currently available."}</p>;
  return <Link className="mt-5 inline-flex font-medium underline underline-offset-4" href={workPath(alternate.representation.slug, targetLocale) as Route}>{targetLocale === "zh-CN" ? "阅读中文" : "Read in English"}</Link>;
}

export function ContentWorkPage({work, representation, units, repository}: {work: ContentWork; representation: PublicWorkRepresentation; units: ContentUnit[]; repository: ContentWorkRepository}) {
  const storiesPath = `${representation.language === "en-US" ? "/en" : ""}/stories` as Route;
  return <>
    <Section className="border-b bg-muted/40"><Container><ReadingContainer className="px-0">
      <nav aria-label={representation.language === "zh-CN" ? "面包屑" : "Breadcrumbs"} className="mb-8 text-sm text-muted-foreground"><Link href={storiesPath}>{representation.language === "zh-CN" ? "生命故事" : "Life Stories"}</Link></nav>
      <p className="text-sm font-semibold text-primary">{representation.language === "zh-CN" ? "完整作品" : "Complete work"}</p>
      <h1 className="mt-3 font-serif text-4xl leading-tight md:text-5xl">{representation.title}</h1>
      {representation.subtitle ? <p className="mt-3 text-xl text-muted-foreground">{representation.subtitle}</p> : null}
      <p className="mt-5 text-lg leading-8 text-muted-foreground">{representation.summary}</p>
      {representation.authors.length ? <p className="mt-5 text-sm text-muted-foreground">{representation.language === "zh-CN" ? "作者" : "By"} {representation.authors.join(", ")}</p> : null}
      <AlternateWork work={work} representation={representation} repository={repository} />
    </ReadingContainer></Container></Section>
    <Section><Container><ReadingContainer className="px-0">
      <h2 className="font-serif text-3xl">{representation.language === "zh-CN" ? "目录" : "Contents"}</h2>
      <ol className="mt-7 divide-y border-y">{units.map((unit) => <li key={unit.id} className="py-5"><Link className="font-serif text-xl hover:underline" href={unitPath(representation.slug, unit.slug, representation.language) as Route}>{unit.chapterNumber ? `${representation.language === "zh-CN" ? "第" : "Chapter "}${unit.chapterNumber}${representation.language === "zh-CN" ? "章　" : ": "}` : ""}{unit.title}</Link></li>)}</ol>
    </ReadingContainer></Container></Section>
  </>;
}

export function ContentUnitPage({work, workRepresentation, unit, repository}: {work: ContentWork; workRepresentation: PublicWorkRepresentation; unit: ContentUnit; repository: ContentWorkRepository}) {
  const ordered = repository.getOrderedUnits(work.canonicalId, unit.language);
  const index = ordered.findIndex((candidate) => candidate.canonicalId === unit.canonicalId);
  const previous = index > 0 ? ordered[index - 1] : undefined;
  const next = index >= 0 ? ordered[index + 1] : undefined;
  const alternate = repository.resolvePublicUnitTranslation(unit.canonicalId, unit.language === "zh-CN" ? "en-US" : "zh-CN", unit);
  return <>
    <Section className="border-b bg-muted/40"><Container><ReadingContainer className="px-0">
      <nav aria-label={unit.language === "zh-CN" ? "面包屑" : "Breadcrumbs"} className="mb-8 text-sm text-muted-foreground"><Link href={workPath(workRepresentation.slug, unit.language) as Route}>{workRepresentation.title}</Link></nav>
      <p className="text-sm font-semibold text-primary">{unit.chapterNumber ? `${unit.language === "zh-CN" ? "第" : "Chapter "}${unit.chapterNumber}${unit.language === "zh-CN" ? "章" : ""}` : unit.unitType}</p>
      <h1 className="mt-3 font-serif text-4xl leading-tight md:text-5xl">{unit.title}</h1>
      {!alternate.available ? <p data-translation-unavailable className="mt-5 text-sm text-muted-foreground">{unit.language === "zh-CN" ? "英文版本尚未发布。" : "A Chinese edition is not currently available."}</p> : <Link className="mt-5 inline-flex font-medium underline underline-offset-4" href={unitPath(alternate.workRepresentation.slug, alternate.unit.slug, alternate.unit.language) as Route}>{alternate.unit.language === "zh-CN" ? "阅读中文" : "Read in English"}</Link>}
    </ReadingContainer></Container></Section>
    <Section><Container><ReadingContainer className="px-0"><article className="prose-content"><MDXRemote source={unit.body} /></article></ReadingContainer></Container></Section>
    <Section className="border-t bg-muted/40"><Container><ReadingContainer className="flex flex-col gap-4 px-0 sm:flex-row sm:justify-between">
      {previous ? <Link href={unitPath(workRepresentation.slug, previous.slug, unit.language) as Route}>← {previous.title}</Link> : <span />}
      {next ? <Link href={unitPath(workRepresentation.slug, next.slug, unit.language) as Route}>{next.title} →</Link> : <Link href={workPath(workRepresentation.slug, unit.language) as Route}>{unit.language === "zh-CN" ? "返回目录" : "Back to contents"}</Link>}
    </ReadingContainer></Container></Section>
  </>;
}
