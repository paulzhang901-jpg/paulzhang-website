import type { ContentRepository } from "./repository";
import type { ContentLanguage, NormalizedContentItem } from "@/types/content";
import {itemMatchesTruthLibraryTopic, truthLibraryTopicSlugs} from "./library-topics";

export function getLibraryItems(repository: ContentRepository, locale: ContentLanguage) {
  return repository.getPublishedContent(locale).filter((item) => item.domain === "library");
}

export function getLibraryCollectionItems(repository: ContentRepository, locale: ContentLanguage, collection: string) {
  return getLibraryItems(repository, locale).filter((item) => itemMatchesTruthLibraryTopic(item, collection));
}

export function getActiveLibraryCollections(items: NormalizedContentItem[]) {
  void items;
  // Permanent navigation is taxonomy-driven, not dependent on whether a topic already has content.
  return truthLibraryTopicSlugs();
}
