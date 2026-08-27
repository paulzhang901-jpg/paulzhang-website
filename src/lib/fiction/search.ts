import type { FictionCardRecord } from "@/types/fiction";

export function filterFictionWorks(works: readonly FictionCardRecord[], query: string) {
  const normalized = query.trim().toLocaleLowerCase("zh-CN");
  if (!normalized) return [...works];
  return works.filter((work) => [work.canonicalTitle, ...work.themes].some((value) => value.toLocaleLowerCase("zh-CN").includes(normalized)));
}
