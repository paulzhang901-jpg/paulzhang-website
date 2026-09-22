import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import {aboutWritingEssayPath,getAboutWritingEssay} from "../../src/lib/about-writing-essays";
import {getContentRepository} from "../../src/lib/content/repository";
import {metadataForAboutWritingEssay} from "../../src/lib/seo/metadata";

const zhPath="content/zh-CN/about/speak-write-live-the-word.mdx";
const enPath="content/en-US/about/speak-write-live-the-word.mdx";

test("second Writing & Preaching essay has one bilingual canonical identity",async()=>{
  const repo=await getContentRepository();
  const zh=getAboutWritingEssay(repo,"zh-CN","speak-write-live-the-word");
  const en=getAboutWritingEssay(repo,"en-US","speak-write-live-the-word");
  assert.ok(zh); assert.ok(en);
  assert.equal(zh.canonicalId,"about-writing-vision-001");
  assert.equal(en.canonicalId,"about-writing-vision-001");
  assert.equal(zh.title,"以口传道，以文弘道，以身证道");
  assert.equal(en.title,"Speak the Word. Write the Word. Live the Word.");
  assert.equal(zh.subtitle,"写作、讲道与生命陪伴，是同一个使命的不同表达");
  assert.equal(en.subtitle,"Preaching, Writing, and Walking Alongside Others Are Different Expressions of the Same Calling");
});

test("fixed Scripture wording and verified contextual destinations are preserved",()=>{
  const zh=fs.readFileSync(zhPath,"utf8");
  const en=fs.readFileSync(enPath,"utf8");
  assert.match(zh,/“信道是从听道来的，听道是从基督的话来的。”（罗马书 10:17）/);
  assert.match(en,/“So then faith cometh by hearing, and hearing by the word of God.”\n— Romans 10:17, KJV/);
  assert.doesNotMatch(zh,/\/library\/sermons/);
  assert.doesNotMatch(en,/\/en\/library\/sermons/);
  assert.match(zh,/https:\/\/www\.youtube\.com\/@PaulZhang-j2w/);
  assert.match(en,/https:\/\/www\.youtube\.com\/@PaulZhang-j2w/);
  assert.match(zh,/\[文章\]\(\/library\)/);
  assert.match(en,/\[read\]\(\/en\/library\)/);
  assert.match(zh,/\[陪伴生命成长的空间\]\(\/together\/spiritual-growth\)/);
  assert.match(en,/\[accompanied as they grow\]\(\/en\/together\/spiritual-growth\)/);
  assert.doesNotMatch(zh,/\]\(#\)/); assert.doesNotMatch(en,/\]\(#\)/);
});

test("nested About routes and SEO alternates keep language switch on the same essay",async()=>{
  const repo=await getContentRepository();
  const zh=getAboutWritingEssay(repo,"zh-CN","speak-write-live-the-word")!;
  const en=getAboutWritingEssay(repo,"en-US","speak-write-live-the-word")!;
  assert.equal(aboutWritingEssayPath("zh-CN","speak-write-live-the-word"),"/about/writing-preaching/speak-write-live-the-word");
  assert.equal(aboutWritingEssayPath("en-US","speak-write-live-the-word"),"/en/about/writing-preaching/speak-write-live-the-word");
  const zhMeta=metadataForAboutWritingEssay(zh,aboutWritingEssayPath("zh-CN","speak-write-live-the-word"),aboutWritingEssayPath("en-US","speak-write-live-the-word"));
  const enMeta=metadataForAboutWritingEssay(en,aboutWritingEssayPath("en-US","speak-write-live-the-word"),aboutWritingEssayPath("zh-CN","speak-write-live-the-word"));
  assert.equal(zhMeta.title,"以口传道，以文弘道，以身证道");
  assert.equal(enMeta.title,"Speak the Word. Write the Word. Live the Word.");
  assert.deepEqual(zhMeta.alternates?.languages,{"zh-CN":"https://paulzhang.org/about/writing-preaching/speak-write-live-the-word","en-US":"https://paulzhang.org/en/about/writing-preaching/speak-write-live-the-word"});
  assert.deepEqual(enMeta.alternates?.languages,{"en-US":"https://paulzhang.org/en/about/writing-preaching/speak-write-live-the-word","zh-CN":"https://paulzhang.org/about/writing-preaching/speak-write-live-the-word"});
});

test("section 04 surfaces the second essay without changing permanent About identities",()=>{
  const about=fs.readFileSync("src/components/content/about-page.tsx","utf8");
  const routes=JSON.parse(fs.readFileSync("config/architecture/routes.yaml","utf8"));
  assert.match(about,/Core Philosophy Essay/);
  assert.deepEqual(routes.child_routes["/about"],["profile","calling","education-ministry","writing-preaching","publishing-media","contact","support"]);
  assert.ok(routes.patterns.some((entry:{path:string})=>entry.path==="/about/writing-preaching/[essay-slug]"));
});
