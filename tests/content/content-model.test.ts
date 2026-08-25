import assert from "node:assert/strict";
import test from "node:test";
import { contentFrontmatterSchema } from "../../src/lib/content/schema";
import { discoverAndParseContent } from "../../src/lib/content/discovery";
import { validateContentRecords } from "../../src/lib/content/validation";
import { getTaxonomyRegistry, validateTaxonomy } from "../../src/lib/taxonomy/registry";

const validFrontmatter = {
  id: "lifecycle-item",
  canonical_id: "lifecycle-item",
  slug: "lifecycle-item",
  title: "Lifecycle item",
  summary: "Lifecycle summary",
  content_type: "article",
  language: "zh-CN",
  topics: ["bible"],
  visibility: "public",
  access_level: "public",
};

test("repository samples conform to schema, taxonomy, references, and translation contracts", () => {
  const report = validateContentRecords(discoverAndParseContent());
  assert.deepEqual(report.errors, []);
  assert.equal(report.items.length, 3);
  assert.ok(report.warnings.some((warning) => warning.includes("life-story-sample-001: translation missing for en-US")));
  assert.ok(report.items.filter((entry) => entry.status === "published").every((entry) => entry.publishedAt instanceof Date));
  assert.ok(report.items.filter((entry) => entry.status === "review").every((entry) => entry.publishedAt === undefined));
  assert.ok(report.items.some((entry) => entry.scriptureRefs[0]?.chapterStart === 4));
});

test("publication lifecycle requires timestamps only after publication", () => {
  assert.equal(contentFrontmatterSchema.safeParse({...validFrontmatter, status: "review"}).success, true);
  assert.equal(contentFrontmatterSchema.safeParse({...validFrontmatter, status: "draft", published_at: null}).success, true);
  assert.equal(contentFrontmatterSchema.safeParse({...validFrontmatter, status: "scheduled"}).success, true);
  assert.equal(contentFrontmatterSchema.safeParse({...validFrontmatter, status: "published", published_at: "2026-08-25T12:00:00Z"}).success, true);
  assert.equal(contentFrontmatterSchema.safeParse({...validFrontmatter, status: "published"}).success, false);
  assert.equal(contentFrontmatterSchema.safeParse({...validFrontmatter, status: "published", published_at: "2026-08-25"}).success, false);
  assert.equal(contentFrontmatterSchema.safeParse({...validFrontmatter, status: "archived"}).success, false);
});

test("schema rejects unknown fields and invalid slugs", () => {
  const result = contentFrontmatterSchema.safeParse({slug: "Not Valid", unexpected: true});
  assert.equal(result.success, false);
});

test("taxonomy is consumed from the canonical registry", () => {
  const registry = getTaxonomyRegistry();
  assert.ok(registry.journey_stages.includes("multiply"));
  assert.deepEqual(validateTaxonomy({content_type: "article", topics: ["not-canonical"], life_needs: [], journey_stages: [], audiences: []}), ["unknown topic: not-canonical"]);
});

test("duplicate identities and broken canonical references fail validation", () => {
  const records = discoverAndParseContent();
  const duplicate = structuredClone(records[0]);
  duplicate.sourcePath = "duplicate.mdx";
  const broken = structuredClone(records[1]);
  broken.frontmatter.id = "broken-id";
  broken.frontmatter.canonical_id = "broken-canonical";
  broken.frontmatter.slug = "broken-reference";
  broken.frontmatter.related_content = ["does-not-exist"];
  broken.frontmatter.next_steps = [{type: "content", target: "also-does-not-exist"}];
  const report = validateContentRecords([...records, duplicate, broken]);
  assert.ok(report.errors.some((error) => error.includes("duplicate slug within locale/domain")));
  assert.ok(report.errors.some((error) => error.includes("duplicate canonical_id + locale")));
  assert.ok(report.errors.some((error) => error.includes("broken related_content reference")));
  assert.ok(report.errors.some((error) => error.includes("broken next_steps content reference")));
});
