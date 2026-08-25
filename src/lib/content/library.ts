import type { ContentRepository } from "./repository";
import type { ContentLanguage, NormalizedContentItem } from "@/types/content";

const collectionTopics: Record<string, string[]> = {
  bible: ["bible"],
  gospel: ["gospel"],
  theology: ["theology"],
  formation: ["spiritual-formation"],
  discipleship: ["discipleship"],
  prayer: ["prayer"],
  marriage: ["marriage"],
  family: ["family", "parenting"],
  grief: ["grief", "suffering"],
  "work-money": ["work", "money", "stewardship"],
  leadership: ["leadership"],
  church: ["church", "ministry"],
  mission: ["mission"],
  culture: ["culture"],
  education: ["education", "learning"],
  technology: ["technology", "ai"],
  research: ["research"],
};

export function getLibraryItems(repository: ContentRepository, locale: ContentLanguage) {
  return repository.getPublishedContent(locale).filter((item) => item.domain === "library");
}

export function getLibraryCollectionItems(repository: ContentRepository, locale: ContentLanguage, collection: string) {
  const topics = collectionTopics[collection] ?? [];
  return getLibraryItems(repository, locale).filter((item) => topics.some((topic) => item.topics.includes(topic)));
}

export function getActiveLibraryCollections(items: NormalizedContentItem[]) {
  return Object.entries(collectionTopics)
    .filter(([, topics]) => items.some((item) => topics.some((topic) => item.topics.includes(topic))))
    .map(([slug]) => slug);
}
