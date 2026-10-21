# English pastor biography release — V1

Classification: ARCHITECTURE-COMPLIANT IMPLEMENTATION under accepted ADR-0037 standalone amendment and merged PR #95. Owner: Paul Zhang.

Goal: publish existing The_Conviction_of_Pastor_Zhang.mp4 as The Conviction of Pastor Zhang on /en/about/profile#pastor-biography-video; existing locale-filtered library reference only. Preserve Chinese video and all profile prose. No runtime code, architecture, generation, translation, subtitle, poster or analytics changes.

Source: /Users/chongzhuzhang/Desktop/桌面 - Chongzhu的iMac/读书笔记视频/The_Conviction_of_Pastor_Zhang.mp4 . Bytes15801232; duration343.887528 seconds; H264/AAC. SHA256 4d7a88bf6e5e97db81e20e0b8979d2f5bd47fc1ced274dbeeb2dc8b47d85cd26.

Reuse canonical identity video-pastor-biography-zhang-chongzhu with locale en-US and exact title. No English translation claim about the distinct Chinese video. Versioned standalone metadata fingerprint and a separate one-locale release bind exact MP4 and real preview acceptance.

Allowed paths: this release plan, targeted published-video regression fixture, existing published-videos/governed-video-releases JSON and exact content-addressed MP4 after owner acceptance. Source of existing Profile/player stays unchanged. No analytics or privacy impact beyond owner-approved public biography media.

Measured current media156227119 + new15801232 =172028351 bytes, below256MiB. MP4 below25MiB; release below64MiB. Git loose19128KiB + packed247225KiB plus new media remains below512MiB. No cleanup or history rewriting.

1. Reuse isolated worktree, current main bc5a077cb614ed43efe53c9ea84f8e11f7f114ac. Verify targeted fixture and required checks.
2. Prepare private isolated export using existing lookup/player and unchanged MP4. Test presentation injection only; no fabricated PUBLISHED catalog or acceptance. Noindex, no analytics, visibly NOT PRODUCTION. Confirm preview project production branch and Access protection for HTML/direct MP4 before upload.
3. One focused draft PR carries preparation/tests first, with no unaccepted media bytes in public Git. Deploy protected nonproduction preview, record exact URL, stop for owner acceptance.
4. After acceptance add original hash-named MP4 and exact standalone registry/catalog binding to same PR. Run final required GitHub checks and independent review. Request one exact-head owner GitHub acknowledgement only when final SHA is fixed. Obtain required publication authorization and normal protected merge; use existing main CI production workflow and verify public page/player/download bytes.

Acceptance: correct English title/player/download on English Profile and English library only; Chinese binding/media unchanged; no fake captions or English counterparts; existing components and prose preserved; required checks/build/export pass; actual owner preview acceptance and human GitHub exact-head acknowledgement before merge. Rollback through reviewed removal/retirement of English binding only, preserving immutable source/assets.

Status: PREPARING PROTECTED PREVIEW; owner acceptance and production pending. No media generation/modification authorized or performed.
