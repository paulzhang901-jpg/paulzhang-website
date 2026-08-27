import registry from "../../../config/fiction/intake/canonical-registry/registry.json";
import type { FictionCardRecord, FictionEditorialRecord } from "@/types/fiction";

const sourceWorks = registry.works as FictionEditorialRecord[];

function publicCoverPath(sourcePath: string) {
  const filename = sourcePath.split("/").at(-1);
  if (!filename || !/^\d{2}-[a-z0-9-]+\.jpeg$/.test(filename)) throw new Error(`Invalid fiction cover path: ${sourcePath}`);
  return `/images/fiction/covers/${filename}`;
}

function validate() {
  if (sourceWorks.length !== 12) throw new Error(`Expected 12 fiction works, received ${sourceWorks.length}`);
  const titles = new Set<string>();
  const slugs = new Set<string>();
  for (const work of sourceWorks) {
    if (work.editorialStatus !== "LOCKED") throw new Error(`${work.slug} is not LOCKED`);
    if (!work.canonicalTitle || !work.slug || !work.cover || !work.officialReadingCTA) throw new Error(`${work.slug} is missing a required public field`);
    if (titles.has(work.canonicalTitle) || slugs.has(work.slug)) throw new Error(`Duplicate fiction identity: ${work.slug}`);
    titles.add(work.canonicalTitle);
    slugs.add(work.slug);
    publicCoverPath(work.cover);
  }
  if (titles.has("为什么偏偏是我") || titles.has("每个人都来安慰他")) throw new Error("Excluded fiction work entered the public registry");
}

validate();

const works = Object.freeze(sourceWorks.map((work) => Object.freeze({...work, themes: Object.freeze([...work.themes]) as unknown as string[]})));

export function getFictionWorks(): readonly FictionEditorialRecord[] {
  return works;
}

export function getFictionWork(slug: string) {
  return works.find((work) => work.slug === slug) ?? null;
}

export function getFictionCardRecords(): FictionCardRecord[] {
  return works.map((work) => ({
    canonicalTitle: work.canonicalTitle,
    slug: work.slug,
    cover: publicCoverPath(work.cover),
    editorialHook: work.editorialHook,
    themes: [...work.themes],
  }));
}

export function getFictionCoverPath(work: FictionEditorialRecord) {
  return publicCoverPath(work.cover);
}

export function fictionPath(slug?: string, locale: "zh-CN" | "en-US" = "zh-CN") {
  const base = locale === "en-US" ? "/en/fiction" : "/fiction";
  return slug ? `${base}/${slug}` : base;
}
