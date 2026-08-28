import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import { socialProfiles } from "../../src/data/social-links";
import { localizedPath, resolveEnglishSegments } from "../../src/lib/i18n/routing";

const expectedHashes = {
  "public/assets/social/wechat-official-account-qr.png": "de385e7780f08a81fc5d50d2e7768ee897345115bbb38e841778be691f66a8d6",
  "public/assets/social/wechat-video-channel-qr.png": "deee0624cbbf868e938b4d2f976f4c7a93b7dff1133a19605e3cbc77ee0db045",
};

test("canonical WeChat PNG assets preserve manifest hashes", () => {
  for (const [path, expected] of Object.entries(expectedHashes)) {
    assert.equal(crypto.createHash("sha256").update(fs.readFileSync(path)).digest("hex"), expected);
  }
});

test("social profiles use the approved canonical account data", () => {
  assert.equal(socialProfiles.personalYoutube.url, "https://www.youtube.com/@PaulZhang-j2w");
  assert.equal(socialProfiles.churchYoutube.url, "https://www.youtube.com/@fcfmchurch");
  assert.equal(socialProfiles.churchWebsite.url, "https://fcfmchurch.org");
  assert.equal(socialProfiles.personalWechat.account, "paulzhang1871");
  assert.equal(socialProfiles.wechatOfficialAccount.accountId, "gh_389d8e988d73");
  assert.equal(socialProfiles.wechatVideoChannel.channelId, "sphPDgF96fxpngx");
});

test("approved contact route is bilingual and remains under About", () => {
  assert.equal(localizedPath("contact", "zh-CN"), "/about/contact");
  assert.equal(localizedPath("contact", "en-US"), "/en/about/contact");
  assert.equal(resolveEnglishSegments(["about", "contact"]), "contact");
});

test("mainland contact presentation uses first-party assets without YouTube dependency", () => {
  const page = fs.readFileSync("src/components/product/social-contact-page.tsx", "utf8");
  assert.match(page, /wechatOfficialAccount\.qrAsset/);
  assert.match(page, /wechatVideoChannel\.qrAsset/);
  assert.doesNotMatch(page, /filter:|blur\(|grayscale\(|contrast\(/);
  assert.match(page, /id="mainland-social"/);
});
