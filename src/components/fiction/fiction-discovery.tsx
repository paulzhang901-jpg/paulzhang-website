"use client";

import { useDeferredValue, useId, useMemo, useState } from "react";
import { FictionCard } from "./fiction-card";
import type { FictionCardRecord } from "@/types/fiction";
import { filterFictionWorks } from "@/lib/fiction/search";

export function FictionDiscovery({works, locale}: {works: FictionCardRecord[]; locale: "zh-CN" | "en-US"}) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim().toLocaleLowerCase("zh-CN"));
  const searchId = useId();
  const filtered = useMemo(() => filterFictionWorks(works, deferredQuery), [deferredQuery, works]);
  const copy = locale === "zh-CN"
    ? {heading: "全部作品", helper: "按作品名称或已批准主题查找", label: "搜索小说作品", placeholder: "输入作品名称或主题", count: `显示 ${filtered.length} 部作品`, empty: "没有找到符合条件的作品。"}
    : {heading: "All works", helper: "Search by title or approved theme", label: "Search fiction works", placeholder: "Enter a title or theme", count: `${filtered.length} works shown`, empty: "No matching work was found."};

  return <section id="all-works" aria-labelledby="fiction-all-heading" className="py-[var(--space-section)]">
    <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
      <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Portfolio</p><h2 id="fiction-all-heading" className="mt-2 font-serif text-3xl sm:text-4xl">{copy.heading}</h2><p className="mt-2 text-muted-foreground">{copy.helper}</p></div>
      <div className="w-full md:max-w-sm">
        <label htmlFor={searchId} className="sr-only">{copy.label}</label>
        <input id={searchId} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy.placeholder} className="min-h-12 w-full rounded-full border bg-surface px-5 text-base shadow-sm" />
        <p aria-live="polite" className="mt-2 px-2 text-sm text-muted-foreground">{copy.count}</p>
      </div>
    </div>
    {filtered.length ? <div className="mt-9 grid gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filtered.map((work) => <FictionCard key={work.slug} work={work} locale={locale} />)}</div> : <p className="mt-10 rounded-lg border bg-muted p-6" role="status">{copy.empty}</p>}
  </section>;
}
