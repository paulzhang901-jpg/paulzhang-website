import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import {createContentRepository} from "../../src/lib/content/repository";
import {getMyStoryCollections,getStoryCollectionItems} from "../../src/lib/content/stories";
import {myStoryTopics,myStoryTopicLabel} from "../../src/lib/content/story-topics";
import {item} from "../content/fixtures";

const slugs=["testimonies","turning-points","little-wheat","ministry","suffering-grace","immigration","letters"];
const zh=["我的见证","关键时刻","小麦子的故事","服事的旅程","在苦难中学习","出国与新旅程","写给后来的你"];
const en=["My Testimony","Turning Points","John Earnest Zhang","Ministry Journey","Learning Through Suffering","Immigration & New Journey","Letters to Those Who Come After"];
test("seven permanent My Story categories have exact order and bilingual labels",()=>{assert.deepEqual(getMyStoryCollections(),slugs);assert.deepEqual(slugs.map(x=>myStoryTopicLabel("zh-CN",x)),zh);assert.deepEqual(slugs.map(x=>myStoryTopicLabel("en-US",x)),en);});
test("every My Story category is a functional canonical-topic filter in both locales",()=>{for(const d of myStoryTopics){const topic=d.topics[0];const z=item({id:`z-${d.slug}`,canonicalId:d.slug,slug:d.slug,domain:"stories",topics:[topic]});const e={...z,id:`e-${d.slug}`,language:"en-US" as const};const r=createContentRepository([z,e]);assert.equal(getStoryCollectionItems(r,"zh-CN",d.slug)[0]?.id,z.id);assert.equal(getStoryCollectionItems(r,"en-US",d.slug)[0]?.id,e.id);}});
test("ordinary future Markdown story needs no category/UI code change",()=>{const future=item({id:"future",canonicalId:"future",slug:"future",domain:"stories",topics:["ministry"]});assert.equal(getStoryCollectionItems(createContentRepository([future]),"zh-CN","ministry")[0]?.id,"future");assert.deepEqual(getMyStoryCollections(),slugs);});
test("Truth Library permanent taxonomy remains unchanged",()=>{const source=fs.readFileSync("src/lib/content/library-topics.ts","utf8");for(const slug of ["bible","gospel","theology","formation","marriage","life-values","work-money","church"]) assert.match(source,new RegExp(`slug: ["']${slug}["']`));});

test("Little Wheat work is assigned only to the permanent little-wheat collection", async () => {
  const {getContentWorkRepository} = await import("../../src/lib/content/works/repository");
  const {getStoryCollectionWorks} = await import("../../src/lib/content/story-works");
  const works = await getContentWorkRepository();
  for (const locale of ["zh-CN", "en-US"] as const) {
    const matched = getStoryCollectionWorks(works, locale, "little-wheat");
    assert.equal(matched.length, 1);
    assert.equal(matched[0].work.canonicalId, "work-little-wheat-v1");
    assert.equal(matched[0].representation.slug, "little-wheat");
    for (const other of slugs.filter((slug) => slug !== "little-wheat")) assert.equal(getStoryCollectionWorks(works, locale, other).length, 0);
  }
});

test("My Story desktop uses a left topic sidebar with responsive stacked navigation", () => {
  const source=fs.readFileSync("src/components/content/stories-page.tsx","utf8");
  assert.match(source,/lg:grid-cols-\[17rem_minmax\(0,1fr\)\]/);
  assert.match(source,/lg:flex-col lg:items-start/);
  assert.match(source,/按主题开始探索/);
  assert.match(source,/Explore by Topic/);
  assert.match(source,/flex flex-wrap gap-2 lg:flex-col/);
});
