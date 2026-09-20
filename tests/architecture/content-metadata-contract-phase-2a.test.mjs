import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const schema = JSON.parse(fs.readFileSync(new URL("../../schema/content-frontmatter-v2.schema.json", import.meta.url), "utf8"));
const taxonomy = JSON.parse(fs.readFileSync(new URL("../../config/architecture/taxonomy.yaml", import.meta.url), "utf8"));

test("ordinary growth stages and life domains are optional 0..N", () => {
  assert.equal(schema.required.includes("growth_stages"), false);
  assert.equal(schema.required.includes("life_domains"), false);
  assert.equal(schema.properties.growth_stages.minItems, undefined);
  assert.equal(schema.properties.life_domains.minItems, undefined);
});

test("form/topic are orthogonal and gospel-essay is not registered", () => {
  assert.ok(schema.$defs.registered_content_type.enum.includes("article"));
  assert.equal(schema.$defs.registered_content_type.enum.includes("gospel-essay"), false);
  assert.ok(schema.$defs.primary_topic.enum.includes("gospel"));
});

test("secondary taxonomy excludes relationships", () => {
  assert.equal(schema.$defs.registered_secondary_topic.enum.includes("relationships"), false);
});

test("six established growth stages are preserved", () => {
  assert.deepEqual(schema.properties.growth_stages.items.enum, ["explore","believe","abide","serve","lead","multiply"]);
});

test("schema v2 requires one primary topic", () => {
  assert.equal(schema.properties.schema_version.const, 2);
  assert.ok(schema.required.includes("primary_topic"));
});

test("canonical schema controlled values stay aligned with taxonomy registry", () => {
  assert.deepEqual(schema.$defs.primary_topic.enum, taxonomy.primary_topics);
  assert.deepEqual(schema.$defs.registered_secondary_topic.enum, taxonomy.topics);
  assert.deepEqual(schema.properties.growth_stages.items.enum, taxonomy.journey_stages);
  assert.deepEqual(schema.properties.life_domains.items.enum, taxonomy.life_domains);
});
