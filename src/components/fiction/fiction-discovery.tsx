"use client";

import { useDeferredValue, useId, useMemo, useState } from "react";
import { FictionCard } from "./fiction-card";
import type { FictionCardRecord } from "@/types/fiction";
import { filterFictionWorks, getSharedFictionThemes } from "@/lib/fiction/search";

export function FictionDiscovery({works, locale}: {works: FictionCardRecord[]; locale: "zh-CN" | "en-US"}) {
  const [query, setQuery] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const deferredQuery = useDeferredValue(query.trim().toLocaleLowerCase("zh-CN"));
  const searchId = useId();
  const sharedThemes = useMemo(() => getSharedFictionThemes(works), [works]);
  const filtered = useMemo(() => filterFictionWorks(works, deferredQuery).filter((work) => !selectedTheme || work.themes.includes(selectedTheme)), [deferredQuery, selectedTheme, works]);
  const copy = locale === "zh-CN"
    ? {heading: "全部作品", helper: "按作品名称或已批准主题查找", label: "搜索小说作品", placeholder: "输入作品名称或主题", count: `显示 ${filtered.length} 部作品`, empty: "没有找到符合条件的作品。", themes: "按主题进入", all: "全部"}
    : {heading: "All works", helper: "Search by title or approved theme", label: "Search fiction works", placeholder: "Enter a title or theme", count: `${filtered.length} works shown`, empty: "No matching work was found.", themes: "Enter by approved theme", all: "All"};

  return <section id="all-works" aria-labelledby="fiction-all-heading" className="py-[var(--space-section)]">
    <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
      <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Portfolio</p><h2 id="fiction-all-heading" className="mt-2 font-serif text-3xl sm:text-4xl">{copy.heading}</h2><p className="mt-2 text-muted-foreground">{copy.helper}</p></div>
      <div className="w-full md:max-w-sm">
        <label htmlFor={searchId} className="sr-only">{copy.label}</label>
        <input id={searchId} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy.placeholder} className="min-h-12 w-full rounded-full border bg-surface px-5 text-base shadow-sm" />
        <p aria-live="polite" className="mt-2 px-2 text-sm text-muted-foreground">{copy.count}</p>
      </div>
    </div>
    <div className="mt-8 border-y py-6" aria-labelledby="fiction-theme-heading">
      <p id="fiction-theme-heading" className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">{copy.themes}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" aria-pressed={selectedTheme === null} onClick={() => setSelectedTheme(null)} className="min-h-11 rounded-full border px-4 text-sm transition-colors aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground">{copy.all}</button>
        {sharedThemes.map((theme) => <button key={theme} type="button" aria-pressed={selectedTheme === theme} onClick={() => setSelectedTheme(theme)} className="min-h-11 rounded-full border px-4 text-sm transition-colors aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground">{theme}</button>)}
      </div>
    </div>
    {filtered.length ? <div className="mt-9 grid gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filtered.map((work) => <FictionCard key={work.slug} work={work} locale={locale} />)}</div> : <p className="mt-10 rounded-lg border bg-muted p-6" role="status">{copy.empty}</p>}
  </section>;
}
