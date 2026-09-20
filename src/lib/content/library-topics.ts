import type {ContentLanguage, NormalizedContentItem} from "@/types/content";

/**
 * Permanent Truth Library navigation taxonomy.
 *
 * These are collection identities over the canonical article taxonomy in
 * config/architecture/taxonomy.yaml. They intentionally reuse existing topic
 * IDs so published content does not need migration and zh/en labels share one
 * identity. Add content by assigning canonical `topics` in Markdown; do not
 * edit this file for ordinary publishing.
 */
export const truthLibraryTopics = [
  {slug: "bible", topics: ["bible"], labels: {"zh-CN": "圣经（逐卷讲道）", "en-US": "Bible"}},
  {slug: "gospel", topics: ["gospel"], labels: {"zh-CN": "福音（布道文集）", "en-US": "Gospel"}},
  {slug: "theology", topics: ["theology"], labels: {"zh-CN": "信仰（基要真理）", "en-US": "Faith"}},
  {slug: "formation", topics: ["spiritual-formation", "discipleship", "prayer"], labels: {"zh-CN": "灵命（属灵操练）", "en-US": "Spiritual Life"}},
  {slug: "marriage", topics: ["marriage", "family", "parenting"], labels: {"zh-CN": "婚姻家庭", "en-US": "Marriage & Family"}},
  {slug: "life-values", topics: ["grief", "suffering", "culture", "education", "learning"], labels: {"zh-CN": "人生与价值", "en-US": "Life & Values"}},
  {slug: "work-money", topics: ["work", "money", "stewardship"], labels: {"zh-CN": "金钱与工作", "en-US": "Money & Work"}},
  {slug: "church", topics: ["church", "ministry", "mission", "leadership"], labels: {"zh-CN": "教会与使命", "en-US": "Church & Mission"}},
] as const;

export type TruthLibraryTopicSlug = (typeof truthLibraryTopics)[number]["slug"];

const topicBySlug = new Map<string, (typeof truthLibraryTopics)[number]>(truthLibraryTopics.map((topic) => [topic.slug, topic]));

// Historical collection URLs remain resolvable without becoming duplicate top-level navigation identities.
const legacyCollectionTopics: Record<string, readonly string[]> = {
  discipleship: ["discipleship"], prayer: ["prayer"], family: ["family", "parenting"],
  grief: ["grief", "suffering"], leadership: ["leadership"], mission: ["mission"],
  culture: ["culture"], education: ["education", "learning"], technology: ["technology", "ai"], research: ["research"],
};

export function truthLibraryTopicLabel(locale: ContentLanguage, slug: string) {
  return topicBySlug.get(slug)?.labels[locale] ?? slug;
}

export function truthLibraryCollectionTopics(slug: string): readonly string[] {
  return topicBySlug.get(slug)?.topics ?? legacyCollectionTopics[slug] ?? [];
}

export function truthLibraryTopicSlugs() {
  return truthLibraryTopics.map((topic) => topic.slug);
}

export function itemMatchesTruthLibraryTopic(item: NormalizedContentItem, slug: string) {
  return truthLibraryCollectionTopics(slug).some((topic) => item.topics.includes(topic));
}
