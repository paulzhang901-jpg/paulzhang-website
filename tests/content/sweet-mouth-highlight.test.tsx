import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import React from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {VideosSection} from "../../src/components/content/videos-section";
import {getContentRepository} from "../../src/lib/content/repository";
import {getPublishedVideos} from "../../src/lib/content/published-videos";
import {isSweetMouthHighlight, sweetMouthHighlightSection} from "../../src/lib/content/sweet-mouth-highlight";

test("the exact Chinese highlight uses the existing player without crossorigin or YouTube", async () => {
  const repository = await getContentRepository();
  const video = getPublishedVideos(repository,"zh-CN").find(isSweetMouthHighlight)!;
  assert.ok(video);
  const html = renderToStaticMarkup(<VideosSection locale="zh-CN" items={[video]} showDetails={false} fullWidth heading={sweetMouthHighlightSection.heading} description={sweetMouthHighlightSection.description}/>);
  assert.match(html,/讲道精华视频｜口中甘甜，腹中发苦/);
  assert.match(html,/以启示录10:8–11为中心/);
  assert.match(html,/<video controls="" playsInline="" preload="none"/);
  assert.doesNotMatch(html,/crossorigin|crossOrigin|<iframe|youtube\.com/i);
  assert.ok(!getPublishedVideos(repository,"en-US").some(isSweetMouthHighlight));
});

test("the no-CORS exception never transfers to another source or locale", () => {
  const exact={canonicalId:"sermon-revelation-10-8-11",locale:"zh-CN",mp4:"https://github.com/paulzhang901-jpg/paulzhang-website/releases/download/sermon-sweet-mouth-20261101/4cacb571f183ba4d63f27834a3f4cd75bec5d1bb50315d25e7a6e9720b6cbe8a.mp4"};
  assert.equal(isSweetMouthHighlight(exact),true);
  for(const patch of [{locale:"en-US"},{canonicalId:"other"},{mp4:"https://example.com/video.mp4"}])assert.equal(isSweetMouthHighlight({...exact,...patch}),false);
  assert.match(fs.readFileSync("src/components/content/content-page.tsx","utf8"),/sweetMouthHighlightSection/);
});
