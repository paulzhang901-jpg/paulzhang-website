import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { canonicalContentFrontmatterSchema, contentFrontmatterSchema } from "../../src/lib/content/schema";
import { discoverAndParseContent, discoverContentFiles } from "../../src/lib/content/discovery";
import { normalizeContent } from "../../src/lib/content/normalize";
import { createContentRepository } from "../../src/lib/content/repository";
import { getTaxonomyRegistry } from "../../src/lib/taxonomy/registry";
import { item } from "./fixtures";

const canonicalBase = {
  schema_version: 2, id: "runtime-one", canonical_id: "runtime-one", slug: "runtime-one",
  status: "published", title: "Runtime One", summary: "Runtime summary", content_type: "article",
  primary_topic: "gospel", secondary_topics: ["gospel"], growth_stages: ["explore"], life_domains: ["faith"],
  language: "zh-CN", visibility: "public", access_level: "public", published_at: "2026-09-20T12:00:00-04:00",
};

function fixtureFile(root: string, name: string, data: Record<string, unknown>) {
  const directory = path.join(root, "zh-CN", "library");
  fs.mkdirSync(directory, {recursive: true});
  const yaml = Object.entries(data).map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join("\n");
  fs.writeFileSync(path.join(directory, `${name}.mdx`), `---\n${yaml}\n---\n# Fixture\n\nFixture body.\n`);
}

test("canonical runtime schema accepts Phase 2A metadata while legacy remains compatible", () => {
  assert.equal(canonicalContentFrontmatterSchema.safeParse(canonicalBase).success, true);
  assert.equal(contentFrontmatterSchema.safeParse({
    id: "legacy", canonical_id: "legacy", slug: "legacy", status: "review", title: "Legacy", summary: "Legacy",
    content_type: "article", language: "zh-CN", topics: ["bible"], visibility: "public", access_level: "public",
  }).success, true);
  assert.equal(canonicalContentFrontmatterSchema.safeParse({...canonicalBase, relationships: ["family"]}).success, false);
});

test("runtime controlled values match Phase 2A JSON Schema and taxonomy registry", () => {
  const schema = JSON.parse(fs.readFileSync(path.join(process.cwd(), "schema/content-frontmatter-v2.schema.json"), "utf8"));
  const taxonomy = getTaxonomyRegistry();
  assert.deepEqual(schema.$defs.registered_content_type.enum, taxonomy.content_types);
  assert.deepEqual(schema.$defs.primary_topic.enum, taxonomy.primary_topics);
  assert.deepEqual(schema.$defs.registered_secondary_topic.enum, taxonomy.topics);
  assert.deepEqual(schema.properties.growth_stages.items.enum, taxonomy.journey_stages);
  assert.deepEqual(schema.properties.life_domains.items.enum, taxonomy.life_domains);
});

test("content-only publishing auto-discovers two independent canonical articles and queries metadata", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "paul-content-runtime-"));
  try {
    fixtureFile(root, "runtime-one", canonicalBase);
    let records = discoverAndParseContent(root);
    let repository = createContentRepository(records.map(normalizeContent));
    assert.equal(records.length, 1);
    assert.equal(repository.getContentByPrimaryTopic("gospel").length, 1);
    assert.equal(repository.getContentBySecondaryTopic("gospel").length, 1);
    assert.equal(repository.getContentByGrowthStage("explore").length, 1);
    assert.equal(repository.getContentByLifeDomain("faith").length, 1);
    assert.equal(repository.getContentByContentType("article").length, 1);
    assert.equal(repository.getPublicProjection()[0]?.canonicalUrl, "/library/runtime-one");

    fixtureFile(root, "runtime-two", {
      ...canonicalBase, id: "runtime-two", canonical_id: "runtime-two", slug: "runtime-two",
      title: "Runtime Two", primary_topic: "life-values", secondary_topics: ["culture"],
      growth_stages: [], life_domains: [], published_at: "2026-09-21T12:00:00-04:00",
    });
    records = discoverAndParseContent(root);
    repository = createContentRepository(records.map(normalizeContent));
    assert.deepEqual(repository.getPublicProjection().map((entry) => entry.canonicalUrl).sort(), ["/library/runtime-one", "/library/runtime-two"]);
    assert.equal(repository.getContentByPrimaryTopic("life-values")[0]?.canonicalId, "runtime-two");
  } finally {
    fs.rmSync(root, {recursive: true, force: true});
  }
});

test("draft, private, scheduled, and member content never enter the unified public projection", () => {
  const published = item();
  const candidates = [
    published,
    item({id: "draft-x", canonicalId: "draft-x", slug: "draft-x", canonicalUrl: "/library/draft-x", status: "draft", publishedAt: undefined}),
    item({id: "private-x", canonicalId: "private-x", slug: "private-x", canonicalUrl: "/library/private-x", visibility: "private"}),
    item({id: "scheduled-x", canonicalId: "scheduled-x", slug: "scheduled-x", canonicalUrl: "/library/scheduled-x", status: "scheduled"}),
    item({id: "member-x", canonicalId: "member-x", slug: "member-x", canonicalUrl: "/library/member-x", accessLevel: "member"}),
  ];
  assert.deepEqual(createContentRepository(candidates).getPublicProjection().map((entry) => entry.id), [published.id]);
});

test("duplicate canonical identity and localized slug conflicts fail closed", () => {
  const first = item();
  assert.throws(() => createContentRepository([first, item({id: "duplicate-id", slug: "other", canonicalUrl: "/library/other"})]), /duplicate canonical_id \+ locale/);
  assert.throws(() => createContentRepository([first, item({id: "other-id", canonicalId: "other-id"})]), /duplicate slug within locale\/domain/);
});

test("protected Sermon, Work, and Fiction boundaries cannot be bypassed by ordinary discovery", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "paul-protected-runtime-"));
  try {
    fixtureFile(root, "fake-sermon", {...canonicalBase, id: "fake-sermon", canonical_id: "fake-sermon", slug: "fake-sermon", content_type: "sermon"});
    assert.throws(() => discoverAndParseContent(root), /protected sermon eligibility gate failed/);

    fs.rmSync(path.join(root, "zh-CN"), {recursive: true, force: true});
    fs.mkdirSync(path.join(root, "works", "fake"), {recursive: true});
    fs.writeFileSync(path.join(root, "works", "fake", "unit.mdx"), "---\ninvalid: true\n---\nwork body");
    assert.deepEqual(discoverContentFiles(root), []);

    assert.equal(canonicalContentFrontmatterSchema.safeParse({...canonicalBase, content_type: "fiction"}).success, false);
  } finally {
    fs.rmSync(root, {recursive: true, force: true});
  }
});
