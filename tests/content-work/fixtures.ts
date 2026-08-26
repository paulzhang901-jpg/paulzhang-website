import type { ContentUnit, ContentWork } from "../../src/types/content-work";

const publishedAt = new Date("2026-08-25T12:00:00Z");

export function work(overrides: Partial<ContentWork> = {}): ContentWork {
  return {
    id: "work-fixture",
    canonicalId: "work-fixture",
    workType: "story_book",
    representations: [
      {language: "zh-CN", slug: "ceshi-zuopin", status: "published", title: "测试作品", summary: "架构测试作品。", authors: ["Author"], publishedAt, visibility: "public", accessLevel: "public", seo: {}},
      {language: "en-US", slug: "test-work", status: "published", title: "Test Work", summary: "Architecture test work.", authors: ["Author"], publishedAt, visibility: "public", accessLevel: "public", seo: {}},
    ],
    units: [{canonicalId: "unit-one", order: 1}, {canonicalId: "unit-two", order: 2}],
    sourcePath: "fixture/work.json",
    ...overrides,
  };
}

export function unit(overrides: Partial<ContentUnit> = {}): ContentUnit {
  return {
    id: "unit-one-zh",
    canonicalId: "unit-one",
    workCanonicalId: "work-fixture",
    unitType: "chapter",
    order: 1,
    chapterNumber: 1,
    slug: "diyizhang",
    status: "published",
    title: "第一章",
    language: "zh-CN",
    publishedAt,
    visibility: "public",
    accessLevel: "public",
    seo: {},
    body: "测试正文。",
    sourcePath: "fixture/zh-CN/01.mdx",
    ...overrides,
  };
}

export function bilingualUnits(): ContentUnit[] {
  return [
    unit(),
    unit({id: "unit-one-en", language: "en-US", slug: "chapter-one", title: "Chapter One", body: "Test body.", sourcePath: "fixture/en-US/01.mdx"}),
    unit({id: "unit-two-zh", canonicalId: "unit-two", order: 2, chapterNumber: 2, slug: "dierzhang", title: "第二章", sourcePath: "fixture/zh-CN/02.mdx"}),
    unit({id: "unit-two-en", canonicalId: "unit-two", order: 2, chapterNumber: 2, language: "en-US", slug: "chapter-two", title: "Chapter Two", body: "Second body.", sourcePath: "fixture/en-US/02.mdx"}),
  ];
}
