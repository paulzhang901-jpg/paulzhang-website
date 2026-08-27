import type { FictionCardRecord } from "@/types/fiction";

export function getSharedFictionThemes(works: readonly FictionCardRecord[]) {
  const counts = new Map<string, number>();
  for (const work of works) for (const theme of work.themes) counts.set(theme, (counts.get(theme) ?? 0) + 1);
  return [...counts].filter(([, count]) => count > 1).map(([theme]) => theme);
}

export function filterFictionWorks(works: readonly FictionCardRecord[], query: string) {
  const normalized = query.trim().toLocaleLowerCase("zh-CN");
  if (!normalized) return [...works];
  return works.filter((work) => [work.canonicalTitle, ...work.themes].some((value) => value.toLocaleLowerCase("zh-CN").includes(normalized)));
}
