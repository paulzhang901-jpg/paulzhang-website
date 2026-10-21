import assert from "node:assert/strict";
import fs from "node:fs";
import {createHash} from "node:crypto";
import path from "node:path";
import test from "node:test";

import {validateVideoReleases, VIDEO_LIMITS} from "../../src/lib/media-publishing/video-release-policy.mjs";

const root = process.cwd();

function filesWithin(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, {withFileTypes: true}).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? filesWithin(target) : [target];
  });
}

test("Client Components remain explicitly reviewed and minimal", () => {
  const clientFiles = filesWithin(path.join(root, "src"))
    .filter((file) => /\.[cm]?[jt]sx?$/.test(file) && fs.readFileSync(file, "utf8").startsWith('"use client"'))
    .map((file) => path.relative(root, file));
  assert.deepEqual(clientFiles, [
    "src/components/analytics/google-analytics-consent.tsx",
    "src/components/content/ai-audio-player.tsx",
    "src/components/content/approved-youtube-player.tsx",
    "src/components/content/article-narration.tsx",
    "src/components/content/read-aloud-player.tsx",
    "src/components/content/together-submission-form.tsx",
    "src/components/diagnostics/iphone-audio-diagnostics.tsx",
    "src/components/fiction/fiction-discovery.tsx",
    "src/components/navigation/language-switcher.tsx",
    "src/components/product/engagement-prompts.tsx",
    "src/components/product/home-view-event.tsx",
    "src/components/product/tracked-link.tsx",
  ]);
});

test("raw public assets retain the V1 budget except exact owner-approved media", () => {
  // ADR-0032 sermon, ADR-0033 and bounded ADR-0036: exact identities only; no directory exemption.
  const approved = {
    "media/narration/051402cbabaf7f999ff367335d49eca60d731033de486a22e6b7934f5e3b4597.mp3": 15238296,
    "media/narration/f6273a399805a30c51eb06c112a74adc412911d87c8f84769fb9169df0c3bcdf.mp3": 20377704,
    "media/narration/829c386e3dffc92194d2c020ac2a4bd3874671e15e79fa741c8f56fbfeb3edc1.mp3": 11128915,
    "media/narration/735b3eee7cbea8f37127ea7c0eafd292d00e4a02194e1fdfdfc88ee64c74a8f6.mp3": 14074412,
    "media/narration/9dcd5012f6d1bb6918e1fe341cd0c9be0431c75ad5dc1725b9516f3471765f74.mp3": 4028300,
    "media/video/0f59573e78ce492ca6f9591eb5c8570d61b26233dee2ad2253d3572bc5f0b9e2.mp4": 12744840,
    "media/narration/01c13d929718a954acd89a94426a7944ecd5d3b9d70c3fea5334a0c7c3e16a63.mp3": 5593940,
    "media/video/50d8104f401ac7747e797f3c6013abe80204c9f4f5f2de4852caf2d44386c20e.mp4": 16908265,
  };
  const policyAccepted = /^Status: Accepted(?:\s|$)/m.test(fs.readFileSync(path.join(root, "docs/adr/0037-repeatable-approved-video-releases.md"), "utf8"));
  const read = relative => {
    const target = path.join(root, relative);
    assert.ok(!fs.lstatSync(target).isSymbolicLink(), "Media/source symlinks are not permitted");
    assert.ok(fs.realpathSync(target).startsWith(fs.realpathSync(root) + path.sep), "File must remain inside repository");
    return fs.readFileSync(target);
  };
  const governed = validateVideoReleases(JSON.parse(read("config/media-publishing/governed-video-releases.json")), {
    policyAccepted, read,
    standalonePolicyAccepted: fs.readFileSync(path.join(root,"docs/adr/0037-repeatable-approved-video-releases.md"),"utf8").includes("## Accepted amendment — Approved Standalone Videos"),
    youtubePolicyAccepted: /^Status: Accepted(?:\s|$)/m.test(fs.readFileSync(path.join(root, "docs/adr/0038-still-unrepentant-youtube-exception.md"), "utf8")),
    catalog: JSON.parse(read("config/media-publishing/published-videos.json")).records,
    narrations: JSON.parse(read("config/media-publishing/published-narrations.json")).records,
  });
  for (const [relative, bytes] of governed) {
    assert.ok(!Object.hasOwn(approved, relative), "Governed assets cannot redefine legacy exceptions");
    approved[relative] = bytes;
  }
  const publicRoot = path.join(root, "public");
  const mediaBytes = filesWithin(path.join(publicRoot, "media")).reduce((total, file) => total + fs.statSync(file).size, 0);
  assert.ok(mediaBytes <= VIDEO_LIMITS.repositoryMediaBytes, "Cumulative public/media budget exceeded");
  for (const [relative, bytes] of Object.entries(approved)) {
    const content = fs.readFileSync(path.join(publicRoot, relative));
    assert.equal(content.length, bytes);
    assert.equal(createHash("sha256").update(content).digest("hex"), path.basename(relative, path.extname(relative)));
  }
  const oversized = filesWithin(publicRoot)
    .filter((file) => !/^ebooks\/[^/]+\.pdf$/.test(path.relative(publicRoot, file)))
    .filter((file) => !Object.hasOwn(approved, path.relative(publicRoot, file)))
    .filter((file) => fs.statSync(file).size > 1024 * 1024)
    .map((file) => path.relative(root, file));
  assert.deepEqual(oversized, []);
});
