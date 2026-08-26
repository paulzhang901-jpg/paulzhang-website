import assert from "node:assert/strict";
import test from "node:test";
import { createContentRepository } from "../../src/lib/content/repository";
import { createContentWorkRepository } from "../../src/lib/content/works/repository";
import { validateContentWorks } from "../../src/lib/content/works/validation";
import { item } from "../content/fixtures";
import { bilingualUnits, unit, work } from "./fixtures";

test("ordered child units resolve deterministically without changing ContentItem behavior", () => {
  const repository = createContentWorkRepository([work()], bilingualUnits());
  assert.deepEqual(repository.getOrderedUnits("work-fixture", "zh-CN").map((entry) => entry.canonicalId), ["unit-one", "unit-two"]);
  assert.equal(createContentRepository([item()]).getPublishedContent().length, 1);
});

test("missing child, duplicate membership, invalid parent, and cross-locale order fail", () => {
  assert.ok(validateContentWorks([work()], bilingualUnits().filter((entry) => entry.canonicalId !== "unit-two")).errors.some((error) => error.includes("missing referenced unit")));
  const secondWork = work({id: "second-work", canonicalId: "second-work", units: [{canonicalId: "unit-one", order: 1}], sourcePath: "fixture/second.json"});
  assert.ok(validateContentWorks([work(), secondWork], bilingualUnits()).errors.some((error) => error.includes("duplicate unit membership")));
  assert.ok(validateContentWorks([work()], [unit({workCanonicalId: "wrong-work"}), ...bilingualUnits().slice(1)]).errors.some((error) => error.includes("invalid parent work")));
  assert.ok(validateContentWorks([work()], [unit(), unit({id: "unit-one-en", language: "en-US", order: 2, slug: "chapter-one"}), ...bilingualUnits().slice(2)]).errors.some((error) => error.includes("cross-locale order divergence")));
});

test("localized work slugs are unique across works", () => {
  const secondWork = work({
    id: "second-work",
    canonicalId: "second-work",
    representations: work().representations.map((representation) => ({...representation})),
    units: [{canonicalId: "second-unit", order: 1}],
    sourcePath: "fixture/second.json",
  });
  const secondUnits = bilingualUnits().slice(0, 2).map((entry) => ({
    ...entry,
    id: entry.id.replace("unit-one", "second-unit"),
    canonicalId: "second-unit",
    workCanonicalId: "second-work",
    sourcePath: entry.sourcePath.replace("01", "second"),
  }));
  assert.ok(validateContentWorks([work(), secondWork], [...bilingualUnits(), ...secondUnits]).errors.some((error) => error.includes("duplicate localized work slug")));
});

test("public units require a public parent work and unpublished units never leak", () => {
  const reviewWork = work({representations: work().representations.map((representation) => ({...representation, status: "review", publishedAt: undefined}))});
  assert.equal(createContentWorkRepository([reviewWork], bilingualUnits()).getPublicUnitBySlug("ceshi-zuopin", "diyizhang", "zh-CN"), null);
  const reviewUnit = unit({status: "review", publishedAt: undefined});
  assert.equal(createContentWorkRepository([work({units: [{canonicalId: "unit-one", order: 1}]})], [reviewUnit]).getOrderedUnits("work-fixture", "zh-CN").length, 0);
});
