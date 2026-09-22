import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import {churchProfile} from "../../src/data/church";
import {socialProfiles} from "../../src/data/social-links";
import {communitySectionCopy,getCommunitySectionIds} from "../../src/lib/community";
import {metadataForCommunitySection} from "../../src/lib/seo/metadata";

test("FCFMC introduction remains Community section 01 and preserves sections 02-07",()=>{
  assert.deepEqual(getCommunitySectionIds(),["church","sunday","groups","choir","youth","care","join"]);
  assert.deepEqual(["sunday","groups","choir","youth","care","join"].map(id=>communitySectionCopy("zh-CN",id as never).label),["主日信息与活动","小组与团契","诗班与服事","青年与下一代","社区关怀","加入我们"]);
  assert.deepEqual(["sunday","groups","choir","youth","care","join"].map(id=>communitySectionCopy("en-US",id as never).label),["Sunday Worship & Events","Groups & Fellowship","Choir & Serving","Youth & Next Generation","Community Care","Join Us"]);
});

test("FCFMC profile reuses verified canonical church links and current owner-provided location",()=>{
  assert.equal(churchProfile.website.url,socialProfiles.churchWebsite.url);
  assert.equal(churchProfile.website.url,"https://fcfmchurch.org");
  assert.equal(churchProfile.youtube.url,socialProfiles.churchYoutube.url);
  assert.equal(churchProfile.youtube.url,"https://www.youtube.com/@fcfmchurch");
  assert.equal(churchProfile.youtube.handle,"@fcfmchurch");
  assert.equal(churchProfile.conference,"Crossroads Conference");
  assert.equal(churchProfile.gatheringLocation.street,"6042 W 100 N");
  assert.equal(churchProfile.gatheringLocation.cityRegionPostal,"Greenfield, IN 46140");
});

test("FCFMC page contains approved bilingual facts and excludes stale or unverified specifics",()=>{
  const page=fs.readFileSync("src/components/content/church-introduction-page.tsx","utf8");
  for(const value of ["The First Chinese Free Methodist Church of Indianapolis","我们是谁","我们的宗派传统","我们的属灵归属","我们现在在哪里","寻找一个可以扎根的家","在线认识我们","Who We Are","Our Free Methodist Heritage","Our Conference","Where We Gather Today","Looking for a Place to Call Home","Connect With Our Church Online"]) assert.match(page,new RegExp(value));
  assert.match(page,/1860/); assert.match(page,/salvation by grace through faith/); assert.match(page,/entire sanctification/); assert.match(page,/Crossroads Conference/);
  assert.doesNotMatch(page,/9035 E 21st/i); assert.doesNotMatch(page,/Gathering Church/); assert.doesNotMatch(page,/Amity Church/);
  assert.match(page,/Crossroads Conference is our current conference structure/);
  assert.match(page,/target="_blank" rel="noreferrer"/);
  assert.match(page,/community\/sunday/); assert.match(page,/about\/contact/);
});

test("FCFMC metadata has bilingual canonical and hreflang while preserving contract",()=>{
  const zh=metadataForCommunitySection("church","zh-CN"); const en=metadataForCommunitySection("church","en-US");
  assert.equal(zh.title,"印城第一华人循理会"); assert.equal(en.title,"The First Chinese Free Methodist Church of Indianapolis");
  assert.equal(zh.alternates?.canonical,"https://paulzhang.org/community/church");
  assert.equal(en.alternates?.canonical,"https://paulzhang.org/en/community/church");
  assert.equal(zh.alternates?.languages?.["en-US"],"https://paulzhang.org/en/community/church");
  assert.equal(en.alternates?.languages?.["zh-CN"],"https://paulzhang.org/community/church");
});

test("canonical FCFMC social data remains unmodified",()=>{
  const actual=fs.readFileSync("src/data/social-links.ts","utf8");
  assert.match(actual,/https:\/\/fcfmchurch\.org/); assert.match(actual,/https:\/\/www\.youtube\.com\/@fcfmchurch/);
});
