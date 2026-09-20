import type {ContentRepository} from "./repository";
import type {ContentLanguage} from "@/types/content";
import {itemMatchesMyStoryTopic, myStoryTopicSlugs} from "./story-topics";

export function getStoryItems(repository: ContentRepository, locale: ContentLanguage) {
  return repository.getPublishedContent(locale).filter((item) => item.domain === "stories");
}
export function getStoryCollectionItems(repository: ContentRepository, locale: ContentLanguage, collection: string) {
  return getStoryItems(repository, locale).filter((item) => itemMatchesMyStoryTopic(item, collection));
}
export function getMyStoryCollections() { return myStoryTopicSlugs(); }
