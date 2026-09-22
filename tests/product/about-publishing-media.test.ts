import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import test from "node:test";
import {aboutSectionCopy,getAboutSectionIds} from "../../src/lib/about";
import {metadataForAboutSection} from "../../src/lib/seo/metadata";
import {socialProfiles} from "../../src/data/social-links";

const hash=(p:string)=>crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");

test("Publishing & Media remains permanent About section 05 with bilingual SEO",()=>{
  assert.equal(getAboutSectionIds()[4],"publishing-media");
  const zh=metadataForAboutSection("publishing-media","zh-CN"); const en=metadataForAboutSection("publishing-media","en-US");
  assert.equal(zh.title,"出版与媒体"); assert.equal(en.title,"Publishing & Media");
  assert.equal(zh.alternates?.canonical,"https://paulzhang.org/about/publishing-media");
  assert.equal(en.alternates?.canonical,"https://paulzhang.org/en/about/publishing-media");
  assert.equal(zh.alternates?.languages?.["en-US"],"https://paulzhang.org/en/about/publishing-media");
  assert.equal(en.alternates?.languages?.["zh-CN"],"https://paulzhang.org/about/publishing-media");
  assert.match(aboutSectionCopy("zh-CN","publishing-media").seoDescription??"",/小说.*微信公众号.*信仰/);
  assert.match(aboutSectionCopy("en-US","publishing-media").seoDescription??"",/fiction.*WeChat.*faith/i);
});

test("Publishing page uses canonical social data and verified internal destinations only",()=>{
  const page=fs.readFileSync("src/components/content/publishing-media-page.tsx","utf8");
  assert.equal(socialProfiles.wechatOfficialAccount.displayName,"PaulZhang1871");
  assert.equal(socialProfiles.wechatOfficialAccount.accountId,"gh_389d8e988d73");
  assert.equal(socialProfiles.wechatOfficialAccount.qrAsset,"/assets/social/wechat-official-account-qr.png");
  assert.match(page,/从小说，到文章，到信仰分享/); assert.match(page,/From fiction to essays to reflections on faith/);
  assert.match(page,/\/fiction/); assert.match(page,/\/library/); assert.match(page,/about\/writing-preaching/); assert.match(page,/localizedPath\("grow",locale\)/); assert.match(page,/about\/contact/);
  assert.match(page,/番茄小说 \/ Fanqie Novel/); assert.match(page,/今日头条 \/ Toutiao/);
  assert.doesNotMatch(page,/https?:\/\/(?:www\.)?(?:fanqie|toutiao)/i);
});

test("official account QR remains byte-identical to canonical user-supplied asset",()=>{
  assert.equal(hash("public/assets/social/wechat-official-account-qr.png"),"de385e7780f08a81fc5d50d2e7768ee897345115bbb38e841778be691f66a8d6");
});

test("Fiction and Publishing are bidirectionally connected without fiction distribution changes",()=>{
  const fiction=fs.readFileSync("src/components/fiction/fiction-landing-page.tsx","utf8");
  assert.match(fiction,/\/about\/publishing-media/); assert.match(fiction,/\/en\/about\/publishing-media/);
  assert.match(fiction,/在哪里阅读与关注/); assert.match(fiction,/Where to read and follow/);
  const repository=fs.readFileSync("src/lib/fiction/repository.ts","utf8");
  assert.doesNotMatch(repository,/manuscript|contractPath|verifiedUrl/i);
});

test("protected About 01/02/03/04/06/07 substantive sources remain unchanged",()=>{
  assert.equal(hash("src/lib/about-biography.ts"),"8274c2eec30b67fb8f2a90ad1798a8016d9d34bb49bbe647284ccba24a6adbbf");
  assert.equal(hash("src/components/product/social-contact-page.tsx"),"f4aa9d48984227a3bd292462b336f0bc2ced40e79582672249da6ef784cb9fbe");
  assert.equal(hash("src/components/product/support-page.tsx"),"37254b08bd57f98ab55bff29cbec10313aefadcf6a930a39e3a6335501b21888");
  assert.equal(hash("content/zh-CN/about/speak-write-live-the-word.mdx"),"2fb1eeedc9c845ebe5ebc14a27af4e06499e00b5f6bbda18837837b0d24a3efd");
  assert.equal(hash("content/en-US/about/speak-write-live-the-word.mdx"),"194527ee6f912218f6c177108b73d7b4bf1aff6fdefc6a36613cce1ad294f423");
});
