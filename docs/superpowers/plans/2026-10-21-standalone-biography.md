# Approved Standalone Biography Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans inline; one independent whole-branch review at the end.

**Goal:** privately preview the unchanged Chinese biography MP4 on existing About/Profile and link it from the existing Video Library.
**Architecture:** strict standalone catalog/release variant within the existing system; optional auxiliary assets; preserve every existing article-video rule and release gate.
**Tech Stack:** Next.js static export, React, Zod, node:test; existing Cloudflare Pages/Access and GitHub main workflow.
**Spec:** ../specs/2026-10-20-approved-standalone-videos-design.md
**Authority:** owner has explicitly approved this written spec and the existing numbered implementation plan; execute continuously inline without another design/plan approval cycle.

## Global constraints
- Original SHA-256 367341d326843744a51c2f65aea6f9ea74e6ff349f2df78f9269f477792133a7; 20,096,494 bytes; no media generation/modification.
- Existing /about/profile and /videos only; Chinese-only, no invented article/audio/captions/poster or voice attribution.
- Budgets: MP4 25 MiB, auxiliary 1 MiB, release 64 MiB, public/media 256 MiB, Git object store 512 MiB.
- No public Git MP4 until owner preview acceptance; normal review/exact-head acknowledgement/CI protections remain.

## Review focus
Missing optional files must produce no broken links/tracks. Unknown standalone fields/unsafe primary routes fail closed. Old catalog/release variants cannot inherit standalone exemptions. About anchors cannot become generated video slugs. Private candidate lookup cannot become production approval metadata.

## Task 1 — Governance decision
- [ ] Record approval, update affected architecture notes, review, run architecture/secret/diff checks, push final documentation head.
- [ ] Complete normal GitHub checks/reviews and merge governance-only PR #94 without activating the MP4.

## Task 2 — Strict source/policy branch (TDD)
Files: src/lib/content/published-videos.ts; src/lib/media-publishing/video-release-policy.mjs; schema/governed-video-release.schema.json; tests/quality/video-release-policy.test.mjs; tests/content/published-videos.test.ts.
- [ ] Add failing fixtures for one-locale standalone, optional auxiliaries, stale metadata/hash, invalid category/type/routes, unknown fields, acceptance and budgets; observe red.
- [ ] Add sourceKind=standalone metadata and versioned source fingerprint; extend existing registry with a discriminated standalone variant; preserve strict legacy validation and map returned MP4 budget paths.
- [ ] Observe green including unchanged bilingual/external-video regression tests.

## Task 3 — Existing UI integration (TDD)
Files: existing videos-section.tsx, videos-page.tsx, video-detail-page.tsx, about-page.tsx; existing component/route tests.
- [ ] Add failing render/lookup fixtures for Chinese standalone, About resource labels, absent track/poster/English/AI assertion, unchanged English/profile prose and excluded About static params.
- [ ] Reuse VideosSection for the exact About anchor and separate existing-library category; resolve one record and optional assets safely. No new page or player component.
- [ ] Observe green; include new test files in configured checks only if necessary.

## Task 4 — Required checks and protected candidate
- [ ] Measure actual package/public-media/Git limits; run configured test/type/lint/build/export checks and independent scoped technical/security review; fix only findings in scope.
- [ ] Use a private isolated candidate export with the exact approved MP4 and test presentation lookup, visible NOT PRODUCTION, noindex and analytics disabled. Do not create PUBLISHED production approval/owner acceptance for the candidate.
- [ ] Verify Access protection on existing project HTML and exact media URL before upload; deploy only non-production branch and verify both protected URLs.
- [ ] Return exact /about/profile#pastor-biography-video and /videos preview URLs; stop for owner actual-device acceptance.

## Later publication
A separate publication PR is necessary only because the owner explicitly requested merging governance first and ADR-0037 forbids public candidate bytes before acceptance. Create it after acceptance with the same reviewed source/code and exact media; require final-head human GitHub acknowledgement/checks/reviews and separate production permission. Do not merge biography production now.
