import assert from "node:assert/strict";
import test from "node:test";
import {createContentRepository} from "../../src/lib/content/repository";
import {getActiveLibraryCollections, getLibraryCollectionItems} from "../../src/lib/content/library";
import {truthLibraryTopics, truthLibraryTopicLabel} from "../../src/lib/content/library-topics";
import {item} from "../content/fixtures";

const slugs = ["bible", "gospel", "theology", "formation", "marriage", "life-values", "work-money", "church"];
const zh = ["圣经（逐卷讲道）", "福音（布道文集）", "信仰（基要真理）", "灵命（属灵操练）", "婚姻家庭", "人生与价值", "金钱与工作", "教会与使命"];
const en = ["Bible", "Gospel", "Faith", "Spiritual Life", "Marriage & Family", "Life & Values", "Money & Work", "Church & Mission"];

test("eight permanent Truth Library topics have stable order and bilingual labels", () => {
  assert.deepEqual(truthLibraryTopics.map((x) => x.slug), slugs);
  assert.deepEqual(slugs.map((x) => truthLibraryTopicLabel("zh-CN", x)), zh);
  assert.deepEqual(slugs.map((x) => truthLibraryTopicLabel("en-US", x)), en);
  assert.deepEqual(getActiveLibraryCollections([]), slugs);
});

test("every permanent topic is a functional filter over canonical article taxonomy", () => {
  for (const definition of truthLibraryTopics) {
    const canonicalTopic = definition.topics[0];
    const zhItem = item({id: `zh-${definition.slug}`, canonicalId: definition.slug, slug: definition.slug, topics: [canonicalTopic]});
    const enItem = {...zhItem, id: `en-${definition.slug}`, language: "en-US" as const};
    const repository = createContentRepository([zhItem, enItem]);
    assert.equal(getLibraryCollectionItems(repository, "zh-CN", definition.slug)[0]?.id, zhItem.id);
    assert.equal(getLibraryCollectionItems(repository, "en-US", definition.slug)[0]?.id, enItem.id);
  }
});

test("legacy canonical topics safely map into permanent collections", () => {
  const cases: Array<[string,string]> = [["prayer","formation"],["family","marriage"],["suffering","life-values"],["stewardship","work-money"],["mission","church"]];
  for (const [topic, collection] of cases) {
    const entry=item({id: topic, canonicalId: topic, slug: topic, topics:[topic]});
    assert.equal(getLibraryCollectionItems(createContentRepository([entry]), "zh-CN", collection)[0]?.id, entry.id);
  }
});

test("ordinary publishing is Markdown-topic driven and does not require active-content configuration", () => {
  const future=item({id:"future-faith", canonicalId:"future-faith", slug:"future-faith", topics:["theology"]});
  const repository=createContentRepository([future]);
  assert.deepEqual(getActiveLibraryCollections([]), slugs);
  assert.equal(getLibraryCollectionItems(repository,"zh-CN","theology")[0]?.id,"future-faith");
});
