# ADR-0042 — David and Goliath: exact bilingual YouTube integration

Status: Accepted for scoped implementation by the owner's Phase 4 instruction. Owner actual iPhone Safari acceptance is now recorded below. Authenticated exact-final-head GitHub acknowledgement remains mandatory before production merge.
Date: 2026-10-29
Owner: Paul Zhang
Classification: ARCHITECTURE CHANGE
Version boundary: V1; one canonical Bible study, two existing public videos.

## Goal and bounded decision

Embed the already published David and Goliath videos in the existing bilingual library and video surfaces. Extend ADR-0038/0040's literal allowlist only for canonical ID `bible-study-david-goliath-faith-over-fear`, channel `UCij02113c9lnl5oZeRKbE6Q` (@PaulZhang-j2w), zh-CN `j4iVhPwUvK8` and en-US `nlt5tOE2AcE`. Public visibility, streaming playback, uploaded captions and YouTube copyright checks were verified in the existing Safari session before this phase. Do not upload again.

Use existing canonical MDX under `/library/david-and-goliath-faith-over-fear` and `/en/library/david-and-goliath-faith-over-fear`; reuse existing video-detail projections and bilingual navigation. The manuscripts reproduce the existing seven-scene narration, distinguish biblical narrative from application, and identify 1 Samuel 17. No existing manuscript or audio is replaced. No new taxonomy, section, navigation component, service, dependency or general provider capability.

Reuse the existing visitor-activated `youtube-nocookie.com` player, responsive aspect ratio, localized disclosure, fullscreen and YouTube fallback. No third-party requests before activation. State caption availability accurately for this pair; retain prior releases' notices. Disclose AI narration/illustrated camera movement and credit Sweet Publishing / FreeBibleimages, CC BY-SA 4.0, with source and license links. Original ambient music uses no external samples. No MP4 is added to Git or the website.

## Delivery contract and release boundaries

Allowed paths: this ADR/index and release-boundary reference; the two new library MDX files; exact bindings in existing video catalog resolver/player/article presentation; one candidate release manifest and focused policy/content tests. Runtime catalog additions occur only after actual acceptance; no fabricated owner acceptance or source commit. Preserve every previous catalog entry, source and audio binding.

Public draft PR may contain scoped code, draft manuscripts and pending metadata, consistent with ADR-0037's accepted candidate-preparation boundary. Before activation, build a temporary candidate from this same tree, enable only these draft pages/bindings for the existing Access-protected preview, verify anonymous denial and technical desktop/mobile behavior, then obtain the owner's actual iPhone Safari playback/pause/fullscreen/language acceptance. Do not describe automation as owner device acceptance. Record exact tested source hashes and preview origin. Complete this same PR with accepted bindings, required CI and independent technical/security review. Obtain a human-authored authenticated GitHub acknowledgement of the exact final 40-character HEAD; changed source invalidates prior acceptance. Use normal protected main merge and ADR-0021 deployment. No feature-branch production, self-approval or bypass.

Acceptance criteria/tests: exact locale/channel/ID mapping; reject swapped locale, arbitrary ID/channel, missing policy/owner acceptance, incomplete pair and stale source; retain activation gate and prior releases; existing source and audio remain unchanged; content validation, required CI/build/export; live bilingual playback and responsive layout after deployment. Archive exact published bodies and final URLs in the existing Paul AI Brain vault without duplicate records. Rollback uses a normal reviewed revert of this integration, preserving public YouTube videos.

Analytics impact: none. Privacy impact: existing disclosed visitor-activated YouTube connection only. ADR impact: two exact additional bindings and new canonical study in existing sections; all ADR-0037/0038/0040 release gates remain in effect. Publication authorization is supplied by Phase 4, but is not evidence of future iPhone acceptance or GitHub human acknowledgement.


## Publication activation checkpoint

PR #104 merged as `32be1451d4cfa7d73da82e4e55c1a544dba45d0f` and its main-only production deployment succeeded (Actions run `40996230496`). That preparation tree intentionally retained draft sources and omitted both runtime catalog records, so the study readers returned 404 and the existing listings could not discover the videos. Re-running the same deployment cannot activate absent records.

The owner subsequently answered “已实际检查，两种语言均通过” to the explicit actual iPhone Safari question covering this exact bilingual preview's playback, pause, fullscreen and language switching. Acceptance recorded at 2026-10-30T03:25:10Z for protected preview `41a20f25`. The publication fix changes only both existing draft statuses, registers the two approved catalog tuples, binds exact published source bytes/commit and this actual acceptance, and adds a real-catalog regression test covering public readers, video routes and translation discovery. Existing manuscript bodies, runtime code, prior media and release rules remain unchanged. Final-head authenticated human GitHub acknowledgement, required checks/review, normal protected main merge and live verification remain external requirements, not claims in the metadata.
