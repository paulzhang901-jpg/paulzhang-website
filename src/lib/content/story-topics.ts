import type {ContentLanguage, NormalizedContentItem} from "@/types/content";

/** Permanent My Story navigation taxonomy over the canonical topic registry. */
export const myStoryTopics = [
  {slug: "testimonies", topics: ["gospel", "discipleship"], labels: {"zh-CN": "我的见证", "en-US": "My Testimony"}},
  {slug: "turning-points", topics: ["life-direction", "calling"], labels: {"zh-CN": "关键时刻", "en-US": "Turning Points"}},
  {slug: "little-wheat", topics: ["grief", "family"], labels: {"zh-CN": "小麦子的故事", "en-US": "John Earnest Zhang"}},
  {slug: "ministry", topics: ["ministry", "leadership"], labels: {"zh-CN": "服事的旅程", "en-US": "Ministry Journey"}},
  {slug: "suffering-grace", topics: ["suffering", "grief"], labels: {"zh-CN": "在苦难中学习", "en-US": "Learning Through Suffering"}},
  {slug: "immigration", topics: ["culture", "education", "learning"], labels: {"zh-CN": "出国与新旅程", "en-US": "Immigration & New Journey"}},
  {slug: "letters", topics: ["discipleship", "family", "ministry"], labels: {"zh-CN": "写给后来的你", "en-US": "Letters to Those Who Come After"}},
] as const;

const bySlug = new Map<string, (typeof myStoryTopics)[number]>(myStoryTopics.map((topic) => [topic.slug, topic]));
const legacyStoryTopics: Record<string, readonly string[]> = {
  "my-journey": ["life-direction", "calling", "discipleship"], faith: ["gospel", "theology"],
  family: ["family", "parenting"], learning: ["education", "learning"],
};

export function myStoryTopicLabel(locale: ContentLanguage, slug: string) { return bySlug.get(slug)?.labels[locale] ?? slug; }
export function myStoryTopicSlugs() { return myStoryTopics.map((topic) => topic.slug); }
export function myStoryCollectionTopics(slug: string): readonly string[] { return bySlug.get(slug)?.topics ?? legacyStoryTopics[slug] ?? []; }
export function itemMatchesMyStoryTopic(item: NormalizedContentItem, slug: string) { return myStoryCollectionTopics(slug).some((topic) => item.topics.includes(topic)); }
