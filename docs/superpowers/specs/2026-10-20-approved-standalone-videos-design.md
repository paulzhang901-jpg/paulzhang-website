# Approved Standalone Videos — concise written specification

Status: Approved by the owner in the direct OWNER APPROVAL — PR #94 instruction on 2026-10-21; implementation and protected preview authorized, biography production merge deferred.
Owner: Paul Zhang. Version: V1. Classification: ARCHITECTURE CHANGE.
Continuation checkpoint: existing standalone-biography-video worktree; the prior quota failure occurred before writing files. This document records the already selected design, not a restarted design process.

## Exact existing candidate
- Title/file: `一位牧师的旅程：张崇助的故事.mp4`.
- Source: existing Desktop / 桌面 - Chongzhu的iMac / 读书笔记视频 file.
- Bytes: 20,096,494 (19.17 MiB); verified duration: 421.767256 seconds.
- Existing codecs: H.264 video, AAC audio.
- SHA-256: `367341d326843744a51c2f65aea6f9ea74e6ff349f2df78f9269f477792133a7`.
- Preserve the exact original bytes. No regeneration, modification, recompression, English counterpart, new infrastructure or YouTube.

## Narrow ADR-0037 amendment
Add a discriminated `standalone` release/catalog branch and category `approved-standalone-videos` (Approved Standalone Videos / 已批准的独立视频), limited to owner-approved biography, testimony and sermon videos. Existing bilingual article-video rules and the exact external-video exception remain unchanged. Extend ADR-0034's article-only discovery boundary only for this new governed branch; use ADR-0025's existing Profile category without adding or renaming an About route/category.

For standalone records, require only the locales actually supplied and approved. Do not require a synthetic Library article, English counterpart or MP3. Each locale requires an exact approved MP4. Existing approved captions/SRT/poster may be referenced when supplied; do not fabricate them, create empty tracks or display unavailable download links. Caption and provenance availability must be represented honestly; do not infer an AI narrator or a human voice recording from the filename.

## Minimal implementation contract after approval
Keep the existing published-videos runtime catalog as the only video lookup. Add a strict standalone variant containing the canonical video identity, owner title, locale, allowed type, primary page and exact MP4 reference. The existing governed release registry binds its versioned metadata fingerprint, immutable source commit, asset hashes/sizes and owner evidence. No parallel article body, new runtime service or duplicate video catalog. Unknown/unregistered/stale/unsafe/duplicate records fail closed. Existing article-linked schemas remain unchanged.

Candidate identity: `video-pastor-biography-zhang-chongzhu`, `zh-CN`, `biography`. Attach the existing player to `/about/profile#pastor-biography-video`, preserving all existing biography prose/navigation. The Chinese Video Library projects the same record and links to that section, reusing the same immutable MP4. English pages do not pretend an English video exists. Do not create `/about/biography` or another biography page. Do not accidentally generate `/videos/profile#...` through existing video static-parameter logic.

Reuse VideosSection/native controls, playsInline, preload=none, safe links and the existing static export. Make only the narrow presentation changes needed for standalone optional assets and a correctly labelled About resource link; preserve existing article/audio/video behavior and all original media.

## Preserved release gates
Retain exact hash-named same-origin media, 25 MiB per MP4, 1 MiB per auxiliary file, 64 MiB per release, 256 MiB cumulative public/media and 512 MiB local Git object-store stop thresholds. Check only the actual remaining package/Git allowance before upload. No wildcard exemption, splitting, cleanup, Git LFS or history rewrite.

Use only the existing Cloudflare Pages project/non-production branch. Before any candidate upload, verify Access protects both HTML and direct media and that production branch targeting is unchanged. Keep candidates private/noindex; no unaccepted MP4 bytes in this public GitHub PR. Preserve CSP, privacy/analytics boundaries and the existing production workflow.

Keep independent technical/security review, owner actual-device preview acceptance for the exact candidate, final-head required GitHub checks/eligible reviews, a distinct human-authored exact-head owner GitHub acknowledgement, separate production authorization, normal protected merge and main revalidation/deployment. Metadata and agent-authored comments cannot substitute for these approvals. Stop before production merge until the owner accepts the preview.

## Owner-authorized PR sequencing and allowed paths
The owner’s 2026-10-21 continuation explicitly requests normal merge of the governance amendment first. Complete governance-only PR #94 without activating media, then implement and test locally and deploy the protected preview. After owner acceptance, a focused publication PR may add the unchanged MP4/release evidence and complete final-head checks/review/acknowledgement. No additional design approval is required; production merge remains deferred.

Governance paths: this specification, ADR-0037 accepted addendum, ADR index, the execution plan and affected architecture/IA notes. Approved implementation paths: narrow existing video catalog/registry/schema/lookup/player/static-param tests, About/Profile attachment, exact asset budget entry and related architecture/IA notes. No unrelated files, manuscript edits, new components/pages, hosting changes or media generation.

## Acceptance criteria
- Chinese-only standalone fixture succeeds without fake English/MDX/MP3/auxiliary assets; invalid, unsafe, unregistered or stale fixtures fail.
- Existing bilingual/external-video identity, regression, security and budget tests remain intact.
- Existing About prose/routes and English pages remain unchanged; About and Video Library resolve one canonical record/MP4.
- Required configured architecture/content/application/security/performance checks, typecheck/lint and static-export validation pass on the implementation; no repeated completed media audits.
- Protected preview proves anonymous Access enforcement on HTML and MP4; owner accepts the exact actual-device candidate and available playback/download/caption behavior. No invented device details or reused acceptance from another video.
- Final GitHub checks/reviews and exact-head owner acknowledgement precede any normal merge; production uses existing main workflow only.

Rollback: reviewed retirement/removal of only the new binding and About attachment; preserve the original video and prior immutable media/evidence.

Owner written approval is recorded in ADR-0037. Continue the already approved implementation plan inline; no repeated design approval is requested. Protected preview acceptance and final-head publication approval remain separate future gates.
