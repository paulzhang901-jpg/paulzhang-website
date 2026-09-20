import type { NormalizedContentItem } from "../../src/types/content";

export function item(overrides: Partial<NormalizedContentItem> = {}): NormalizedContentItem {
  return {
    schemaVersion: 1, id: "item-zh", canonicalId: "canonical-001", slug: "sample", domain: "library", language: "zh-CN",
    status: "published", contentType: "article", primaryTopic: "bible", secondaryTopics: ["bible"], growthStages: ["explore"], lifeDomains: [],
    title: "Sample", summary: "Summary", topics: ["bible"],
    lifeNeeds: ["bible-understanding"], journeyStages: ["explore"], audiences: ["christian"], authors: ["Paul Zhang"],
    publishedAt: new Date("2026-08-24T12:00:00Z"), updatedAt: new Date("2026-08-24T12:00:00Z"),
    visibility: "public", accessLevel: "public", scriptureRefs: [],
    formation: {reflectionPrompts: [], practices: [], discussionQuestions: [], nextSteps: []},
    relatedContent: [], seo: {}, body: "Body", sourcePath: "fixture.mdx", canonicalUrl: "/library/sample", ...overrides,
  };
}
