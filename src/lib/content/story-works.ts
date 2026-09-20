import type {ContentWorkRepository} from "./works/repository";
import type {ContentLanguage} from "@/types/content";

/** Canonical work identities assigned to permanent My Story categories. */
const workCategories: Readonly<Record<string, readonly string[]>> = {
  "little-wheat": ["work-little-wheat-v1"],
};

export function getStoryCollectionWorks(repository: ContentWorkRepository, locale: ContentLanguage, collection: string) {
  const canonicalIds = new Set(workCategories[collection] ?? []);
  return repository.getPublishedWorks(locale).filter(({work}) => canonicalIds.has(work.canonicalId));
}
