import assert from "node:assert/strict";
import test from "node:test";
import { createContentWorkRepository } from "../../src/lib/content/works/repository";
import { getUnitStaticParams, resolveUnitRoute, resolveWorkRoute, unitPath, workPath } from "../../src/lib/content/works/routing";
import { bilingualUnits, work } from "./fixtures";

test("bilingual work and unit routes use localized slugs with stable canonical identity", () => {
  const repository = createContentWorkRepository([work()], bilingualUnits());
  assert.equal(resolveWorkRoute("ceshi-zuopin", "zh-CN", repository).kind, "work");
  assert.equal(resolveWorkRoute("test-work", "en-US", repository).kind, "work");
  assert.equal(resolveUnitRoute("ceshi-zuopin", "diyizhang", "zh-CN", repository).kind, "unit");
  assert.equal(resolveUnitRoute("test-work", "chapter-one", "en-US", repository).kind, "unit");
  assert.equal(workPath("ceshi-zuopin", "zh-CN"), "/stories/ceshi-zuopin");
  assert.equal(unitPath("test-work", "chapter-one", "en-US"), "/en/stories/test-work/chapter-one");
  assert.deepEqual(getUnitStaticParams("en-US", repository)[0], {workSlug: "test-work", unitSlug: "chapter-one"});
});

test("missing translations and invalid nested routes remain explicit", () => {
  const units = bilingualUnits().filter((entry) => !(entry.canonicalId === "unit-two" && entry.language === "en-US"));
  const repository = createContentWorkRepository([work()], units);
  assert.equal(repository.resolvePublicUnitTranslation("unit-two", "en-US").status, "missing");
  assert.equal(resolveUnitRoute("ceshi-zuopin", "does-not-exist", "zh-CN", repository).kind, "not-found");
  assert.equal(resolveUnitRoute("wrong-work", "diyizhang", "zh-CN", repository).kind, "not-found");
});
