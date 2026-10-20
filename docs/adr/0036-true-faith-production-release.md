# ADR-0036 — Bounded True Faith production release
Status: Accepted — explicit Paul Phase 7G.2 mechanism approval; final release gates remain pending
Date: 2026-10-19
Owner: Paul Zhang
Scope: V1; bounded release-boundary amendment to ADR-0032 for article-what-is-true-faith only

## Accepted bounded decision
For only the exact bilingual bodies and ten existing media hashes in config/media-publishing/releases/what-is-true-faith-production-candidate.json, permit a reviewed GitHub release record plus authenticated owner PR approval to retain the release decision and provenance instead of activating the unimplemented administration service. Do not reuse the sermon or Knowledge and Wisdom exceptions. Paul explicitly accepted this proposed controlled process in Phase 7G.2 on 2026-10-19. Implementation preparation is authorized; the pending authenticated GitHub final-binding review and final release confirmation are not inferred from this conversation.

Paul has separately approved the Chinese/English content, existing MP3/MP4/subtitles and reported US/mainland mobile PASS in Phase 7G.1. These are owner statements, not independent agent tests. Phase 7G.1 expressly withholds final deployment until requirements pass and Paul confirms.

## Exact asset and source boundary
Canonical ID article-what-is-true-faith; Chinese /library/what-is-true-faith and English /en/library/what-is-true-faith. Video detail counterparts /videos/what-is-true-faith and /en/videos/what-is-true-faith. Preserve all approved body/media bytes, AI narration disclosure, design and existing security. No new generation, model API, provider, paid service, administration service or Access/DNS change.
The candidate manifest binds 2 Markdown bodies, 2 MP3, 2 MP4, 2 SRT, 2 VTT and 2 posters. Approved web assets total 39,408,920 bytes (about 37.6 MiB). Exact current MDX hashes differ from body hashes because of metadata. Published MDX source/presentation hashes and immutable Git source commit must be recomputed and reviewed after publication metadata is prepared; never claim the current base commit contains uncommitted candidates.

## Accepted delivery and exact budget boundary
Track only the ten hash-named web assets in the scoped Git release under public/media/narration and public/media/video so existing main CI deterministically builds normal out without a temporary-preview download dependency. Original masters stay in their existing library. This deliberately adds about 37.6 MiB to Git; no blanket allowance for future large videos.
Explicitly approve only the manifest's four files exceeding 1 MiB (two MP3 and two MP4), with exact sizes and SHA-256 checks in tests/quality/performance-baseline.test.mjs. Preserve the baseline for every other file. This is an exact-asset owner-approved exception, not permission to suppress the existing budget test. All current assets are below the already verified Pages per-file limit.
Never use the temporary test host as the permanent production media origin.

## Historical voice configuration
Verified existing profiles: zh-CN 244bbed5-2976-4803-9af0-55d15326bffb, en-US 1ab6bf84-7d30-4983-ac6c-13a1acc296d2, provider Voicebox. Full historical generation parameters/configuration hash have not been independently reconciled; candidate voiceConfigSha256 is null. Do not substitute the preview fixture's synthetic hash.
Paul's Phase 7G.2 approval accepts the proposed limited historical provenance. A separately labelled legacy voice descriptor identifies only verified provider/profile information; its hash must never be described as a reconstruction of all generation parameters. No new audio generation is proposed.

## Mandatory retained gates
- Authenticated GitHub owner review of exact final source/media bindings, distinct from already recorded content/media approval.
- Reconcile exact approved body and media bytes with authoritative release Git commit; stale or changed bytes block publication.
- Genuine publication event and narration version; immutable hash-addressed media. Never copy test fixture events or local mock approvals.
- Independent technical/security review; existing four blocking CI groups and aggregate validate; no bypass/admin merge/force push.
- One scoped PR containing existing required video integration and this article only, no unrelated manuscripts/features.
- Paul final release confirmation after final PR head/gates are reviewable. Only then approved merge to main; main CI rebuilds/validates normal out and deploys through ADR-0021.
- Post-deploy bilingual article/audio/video/subtitle/download/SEO verification, byte hashes, then exact-body archive verification in the existing Obsidian record.
- No activation of generic ADR-0032 governance service or future-article permission. No inference that a local manifest authenticates an owner.

## Allowed implementation paths
This ADR/index and release-boundary notes; candidate/final release evidence; the two article metadata headers (bodies immutable); exact media/catalog bindings; four exact asset-budget entries and release-integrity tests; already prepared video routes/components/SEO required by this article; scoped report and existing vault archive. No hosting/security/workflow bypass or unrelated content.

## Rollback
Record production baseline c302757a-5ebe-4591-baa6-528879a5d917 (source shown as 46af997) and recheck at release. If delivery fails, use approved immutable-deployment rollback through existing controls; otherwise reviewed release-commit revert through the same CI gates. Never reset main or remove unrelated records. Retain source masters and approval evidence. Existing test host remains until Paul approves cleanup.

## Supersedes
Only ADR-0032's unactivated administration-service/full historical configuration prerequisites for this exact existing article/media release; the bounded reviewed GitHub record and explicitly limited legacy descriptor substitute. ADR-0035's local-only article/media delivery restriction is superseded only for this production candidate after all retained gates pass. ADR-0032 remains authoritative otherwise; ADR-0021 unchanged.
## Superseded By
None.

## Owner mechanism approval — Phase 7G.2
Paul's direct instruction on 2026-10-19: “Paul approves the proposed controlled release process” for this article, and “Finalize ADR-0036 as a narrowly scoped release exception for this approved article and its existing bilingual media only.” Recorded by Codex as execution agent. This records the mechanism, exact delivery/budget and limited historical provenance acceptance from the previously reviewed proposal. It is not an authenticated GitHub review or permission to skip final-head CI/independent review. No deployment has been performed.

