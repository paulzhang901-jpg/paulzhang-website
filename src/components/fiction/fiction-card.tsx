import Image from "next/image";
import Link from "next/link";
import type { FictionCardRecord } from "@/types/fiction";
import { fictionPath } from "@/lib/fiction/repository";

export function FictionCard({work, locale, priority = false}: {work: FictionCardRecord; locale: "zh-CN" | "en-US"; priority?: boolean}) {
  return <article className="group flex h-full flex-col overflow-hidden rounded-[1.1rem] border bg-surface shadow-[var(--shadow-soft)]">
    <Link href={fictionPath(work.slug, locale)} className="relative block aspect-[2/3] overflow-hidden bg-muted">
      <Image src={work.cover} alt={`《${work.canonicalTitle}》封面`} fill priority={priority} sizes="(min-width: 1280px) 22vw, (min-width: 768px) 31vw, 82vw" className="object-contain transition-transform duration-300 group-hover:scale-[1.015]" />
    </Link>
    <div className="flex flex-1 flex-col p-5 sm:p-6">
      <h3 className="font-serif text-2xl leading-snug"><Link href={fictionPath(work.slug, locale)} className="hover:text-primary">《{work.canonicalTitle}》</Link></h3>
      {work.editorialHook ? <p className="mt-3 line-clamp-4 text-sm leading-7 text-muted-foreground">{work.editorialHook}</p> : null}
      {work.themes.length ? <ul aria-label={locale === "zh-CN" ? "主题" : "Themes"} className="mt-4 flex flex-wrap gap-2">{work.themes.slice(0, 3).map((theme) => <li key={theme} className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">{theme}</li>)}</ul> : null}
      <Link href={fictionPath(work.slug, locale)} className="mt-5 inline-flex min-h-11 items-center self-start font-medium text-primary underline decoration-transparent transition-colors hover:decoration-current">
        {locale === "zh-CN" ? "查看作品档案" : "View work profile"}<span aria-hidden="true" className="ml-2">→</span>
      </Link>
    </div>
  </article>;
}
