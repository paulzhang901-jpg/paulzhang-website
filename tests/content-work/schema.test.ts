import assert from "node:assert/strict";
import test from "node:test";
import { contentUnitFrontmatterSchema, contentWorkSchema } from "../../src/lib/content/works/schema";

const representation = {language: "zh-CN", slug: "test-work", status: "review", title: "Test", summary: "Summary", visibility: "public", access_level: "public"};
const work = {id: "test-work", canonical_id: "test-work", work_type: "story_book", representations: [representation], units: [{canonical_id: "unit-one", order: 1}]};
const unit = {id: "unit-one-zh", canonical_id: "unit-one", work_canonical_id: "test-work", unit_type: "chapter", order: 1, slug: "chapter-one", status: "review", title: "Chapter One", language: "zh-CN", visibility: "public", access_level: "public"};

test("valid story_book work and review units require no fake publication timestamp", () => {
  assert.equal(contentWorkSchema.safeParse(work).success, true);
  assert.equal(contentUnitFrontmatterSchema.safeParse(unit).success, true);
  assert.equal(contentUnitFrontmatterSchema.safeParse({...unit, status: "published"}).success, false);
  assert.equal(contentUnitFrontmatterSchema.safeParse({...unit, status: "published", published_at: "2026-08-25T12:00:00Z"}).success, true);
});

test("work schema rejects duplicate order and cyclic membership", () => {
  assert.equal(contentWorkSchema.safeParse({...work, units: [{canonical_id: "unit-one", order: 1}, {canonical_id: "unit-two", order: 1}]}).success, false);
  assert.equal(contentWorkSchema.safeParse({...work, units: [{canonical_id: "test-work", order: 1}]}).success, false);
});
