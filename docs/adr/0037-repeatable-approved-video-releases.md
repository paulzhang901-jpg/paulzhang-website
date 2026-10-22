# ADR-0037 — Repeatable approved bilingual video releases

Status: Accepted — owner authorized completion and normal merge of PR #90 in the final production release instruction; all per-release gates remain mandatory
Date: 2026-10-20
Owner: Paul Zhang
Classification: ARCHITECTURE CHANGE
Scope: V1; offline approved media delivery and release governance only

## Decision proposed before activation

Replace repeated per-article delivery exceptions with a bounded standing workflow for already approved Chinese/English videos attached to published canonical ContentItems. Preserve ADR-0032 generation/admin restrictions and ADR-0033/0036 historical decisions and exact assets. Neither prior exception is copied, broadened or retrospectively rewritten. This ADR supersedes their need for a NEW delivery/budget ADR for each future eligible bilingual video release only AFTER this proposal is reviewed, accepted and merged. No paid generation, credentials, runtime service, identity subsystem, hosting provider or deployment workflow changes.

The production site remains the existing Next.js static export, canonical video catalog, HTML5 player, same-origin Cloudflare Pages media and ADR-0021 main CI deployment. Candidate exports remain private/local or Cloudflare Access protected. No unprotected temporary-host exception is inherited from True Faith.

## Standing limits and registry

A release contains exactly one canonical ID, its zh-CN and en-US variants, and exactly one MP4, SRT, WebVTT and poster per locale. Existing article and narration records must already be PUBLISHED; no second body/audio source is created. Narration provenance remains bound to its existing approved release. The non-runtime registry config/media-publishing/governed-video-releases.json binds release ID, ACTIVE/RETIRED state, immutable source commit, exact source-file/presentation/media hashes, bytes, canonical ID and locale to a recorded owner iPhone acceptance. The existing published-videos catalog remains the only runtime video lookup. Runtime catalog entries must match this registry, existing source and narration identities exactly. Reverse validation rejects any new runtime catalog record absent from an ACTIVE release, even for small or external media. Only the two exact existing ADR-0036 runtime records are grandfathered by full-record fingerprints; altered legacy records are not exempt.

Limits proposed: 25 MiB per MP4; 1 MiB per SRT, VTT or poster; 64 MiB per bilingual release; 256 MiB cumulative checked-out public/media bytes INCLUDING legacy media and this release. No wildcard directory exemption, automatic recompression, silent file splitting, deleting old assets or Git LFS activation. The cumulative bound does not measure historical Git objects: each publication PR must also report Git object-store size and new tracked-media bytes. Halt and seek a reviewed hosting/budget decision if projected tracked media exceed 256 MiB or local Git object storage exceeds 512 MiB; do not rewrite history. These ceilings are deliberately below provider constraints; they are governance limits, not measured network performance guarantees.

Only exact hash-named files under public/media/video are eligible. All eight files must exist and match size/hash; source files must match declared hashes and published narration source bindings; duplicate release IDs and active canonical/locale identities fail closed. Shared exact content-addressed media may be referenced by more than one retained release without copying bytes. The existing over-1-MiB test retains every legacy exact exception, permits only validated registry MP4s, and still rejects every unrelated oversized asset. It also enforces the cumulative tracked-media ceiling. Adding registry metadata alone never authenticates the owner. Nonempty future release registries are rejected while this ADR remains Proposed. Test fixtures exercise the intended accepted-policy behavior without granting production permission.

## Revision and retirement

A later approved version is a new release ID through the same workflow, not a new ADR. Mark the superseded record RETIRED and remove its runtime catalog reference in that reviewed publication PR. Retired records retain their original source commit/hashes and owner evidence as historical provenance; the validator checks their media bytes/budgets but does not misrepresent the old source as the current article or require the current narration binding. Retired records cannot remain in the runtime catalog. They do not authorize new content. Historical identity/approval remains externally auditable through the original reviewed Git commit. Current-source staleness blocks ACTIVE records only. Keep old immutable assets and count them toward the cumulative budget; no silent cleanup or history rewrite. Only one ACTIVE release per canonical/locale may exist. Invalidating/revoking a published binding uses reviewed retirement/revert and preserves audit evidence.

## Required workflow and separate approvals

1. Prepare and approve the canonical sermon/article manuscript, preserving original source and bilingual identity.
2. Generate narration only with separately authorized tools/voices; independently listen to and approve each language. No new production-generation authority is granted here.
3. Export MP3 and bind checksums/configuration provenance; preserve masters and existing published audio identity.
4. Create slides from the actual manuscript and approved visual template; never invent arguments or Bible references.
5. Produce MP4 from the same approved narration; preserve complete audio and record exact media hashes.
6. Generate and review SRT against the spoken wording; never insert unspoken manuscript content. Derive WebVTT losslessly and preserve approved SRT/MP4 bytes.
7. Verify codecs, dimensions, duration, fonts, captions, timing, section transitions, full decoding, black frames and native playback. Unresolved discrepancies block final acceptance; automated transcription similarity is not human listening.
8. Prepare exactly scoped website integration in a clean worktree from latest verified origin/main. Read existing canonical article/audio URLs and prevent duplicates. Report exact release bytes, cumulative media/Git sizes and immutable source commit. Preserve existing design and unrelated records.
9. Prepare an isolated candidate static export using existing app/components; fixture lookup data never become production events. Candidate is visibly NOT PRODUCTION, noindex, excludes analytics/secrets/config/private source. Verify anonymous Access denial/redirect for BOTH HTML and direct media on the existing Pages project's non-production branch BEFORE upload. Confirm production branch is production; never change Access, DNS or custom domains. If protection/authentication is unavailable, STOP. Do not push unaccepted candidate media into a public Git repo/PR or expose a public raw URL. Local/private preparation is not public publication.
10. Owner tests both languages on actual iPhone Safari: audible playback, pause/resume, seeking, captions, subtitle downloads, article/audio links and existing-video regression. Record explicit acceptance, device/browser when supplied, time and exact tested hashes. Never invent device details or reuse another article's acceptance. Publish-candidate metadata must not assert acceptance before it happens.
11. Only after that acceptance, prepare the separate publication PR with exact registry/catalog/media bindings. Bind the approved source commit and immutable media hashes, verify a distinct, human-authored owner acknowledgement of the exact current PR head through GitHub's authenticated API/UI; retain actor, comment/review ID/URL and commit. When the owner is eligible to review, an APPROVED review may record this decision. When the owner authored the PR, use an explicit human-authored exact-head acknowledgement comment instead; it is NOT a GitHub approval review and does not satisfy or reduce any branch-protection review requirement. Obtain the required eligible independent GitHub approval reviews separately; the agent must not fabricate an owner acknowledgement or approve its own PR. Metadata/CI hashes are not proof of identity. Preserve required branch protection, independent technical/security review, all blocking CI groups and aggregate validate; never self-approve, admin-merge or force-push. A new head invalidates review/acceptance for changed source/media. Do not expose candidates in public Git before step 10. A private draft PR may be used earlier only if repository visibility is verified private; no automatic visibility changes.
12. Obtain separate explicit owner production authorization after final-head approvals/checks. Then use normal protected merge and main revalidation/deployment under ADR-0021. No feature-branch production deploy, copied test publication event, bypass or automatic promotion on a local approval flag.
13. Verify production bilingual pages, playback/pause/seek, captions, exact SRT/MP4 downloads/hashes/MIME/range delivery and unchanged existing videos. Verify the established Obsidian canonical archive relationship without duplicate bodies. Record actual deployment/source identity; fail closed on stale bindings. Roll back by normal reviewed revert or separately authorized immutable deployment rollback, preserving originals and evidence.

## Immediate candidates and version boundary

Knowledge and Wisdom uses the existing canonical ID article-knowledge-and-wisdom-2026-10-03 and published bilingual article/audio associations. Its already approved MP4/SRT files remain outside this architecture PR; no media generation, modification, catalog publication, preview upload or production deployment occurs here. Their completed media checks are reused, not rerun. Prior subtitle uncertainty records remain available and must not be described as independently listening-certified by this PR. Phase 8A resumes only after this architecture proposal is approved and merged, and then stops for the specific iPhone acceptance before public production release.

## Delivery contract and impacts

Goal: reusable governed release with no per-sermon ADR within these ceilings. Owner: Paul Zhang. Allowed Paths: this ADR/index; release/deployment/quality architecture references; empty non-runtime release registry; standalone fail-closed validation helper and targeted tests; existing performance baseline integration. No canonical model, route, taxonomy, player, privacy, analytics or AI boundary changes. No new events, cookies, sensitive-data logging, services or dependencies. ADR impact: limited standing delivery/asset-budget rule, without activating generic narration administration.

Acceptance/tests: proposed ADR is not labelled Accepted; zero new media/catalog entries; negative and positive fixture tests for activation, hashes, sizes, unsafe paths, stale sources, absent acceptance, duplicate identities, locale completeness and catalog/audio association; legacy asset checks and unlisted-asset rejection; architecture/content/application/security gates and build/static export. Human GitHub review and owner acceptance cannot be proven by these unit tests and remain external blocking release checks.

## Supersedes

Upon acceptance/merge only: the need to create an individual architecture exception for each eligible future bilingual approved-video delivery. No historical asset or approval is changed. Outside these limits, stop for a new decision.

## Superseded By

None.

## Owner acceptance and merge authorization

The owner’s direct FINAL PRODUCTION RELEASE instruction explicitly authorizes completing PR #90 and merging it when required checks and reviews are satisfied. Recorded by Codex as execution agent, not as an authenticated human GitHub review/comment. Independent technical review of the proposed validator was completed; two findings were corrected and re-reviewed. The active main ruleset requires a PR and validate status, has zero mandatory approval reviews and no bypass actors. This record does not fabricate a review or grant bypass. Revalidate this final head before normal merge. The owner separately authorizes final publication of both existing videos; that authorization is not evidence that the specific protected preview, iPhone Safari acceptance or human exact-head GitHub acknowledgement has occurred. Those per-release conditions remain required.

## Exact external-video boundary

ADR-0038 separately governs only the verified Chinese YouTube sermon 0J44f6acTeQ. It does not grant a local-media exception, alter existing release limits, or authorize other external videos. Its source binding and owner preview acceptance remain required before production registration.


## Accepted amendment — Approved Standalone Videos

Status: Accepted — owner explicitly reviewed and approved the written specification in the direct OWNER APPROVAL — PR #94 instruction on 2026-10-21. Existing bilingual rules remain unchanged for article-linked releases.

Permit an additive strict standalone release/catalog variant for owner-approved biography, testimony and sermon videos under `approved-standalone-videos`. Require only supplied/approved locales and the exact existing MP4; do not invent an English counterpart, article, MP3, subtitle file or poster. Optional existing approved auxiliary assets remain hash-bound. Preserve existing bilingual/external-video rules, all security/performance budgets, private Access-protected preview, owner acceptance, exact-head human GitHub acknowledgement, required checks/reviews and protected main deployment.

For the verified Chinese biography, reuse the existing `/about/profile` section and existing player; add a Video Library reference to the same canonical MP4, without new routes, pages, duplicate components, manuscripts or infrastructure. This narrowly extends ADR-0034's article-only projection while preserving ADR-0025's About identities.

The exact source, schema boundaries, allowed paths, impact review, acceptance criteria and owner-authorized governance-first sequencing are in the [concise written specification](../superpowers/specs/2026-10-20-approved-standalone-videos-design.md). The owner explicitly approved that concrete text before registry/schema/product implementation. This accepted amendment authorizes only the described implementation workflow; candidate uploads require verified Access protection, and publication still requires distinct preview acceptance and final-head GitHub/production approvals.

Approval evidence: “I have reviewed and approve the written specification in PR #94 for the standalone biography video. 批准该书面规格，继续现有计划。” Recorded by Codex as execution agent; this is not a fabricated GitHub review or future preview acceptance. The owner separately authorizes normal merge of the governance amendment after required checks/reviews. No biography production activation is included in that governance-only merge.

## Reading-notes videos — owner-authorized V1 amendment

Status: Accepted for implementation by the owner's direct FINAL TASK — ENABLE READING-NOTES VIDEOS AND PUBLISH instruction on 2026-10-21; production approval remains pending. Classification: ARCHITECTURE EXTENSION.

Extend the existing standalone variant with `reading-notes`. Its primary page is the existing localized `/videos/[slug]` route, with a lowercase hyphenated slug. Other standalone types remain restricted to their existing Profile anchors. Reuse the canonical video catalog, governed release registry, VideosSection player and existing video detail route; no new route family, taxonomy system, manuscript, English translation, audio, captions or poster is invented. Video Library discovery links to this same canonical detail page.

Goal: publish the owner's unchanged Chinese reading-notes MP4, 一个反帝国的共同体：重塑信仰与政治. Owner: Paul Zhang. Scope/version: V1 only. Allowed paths: this ADR, existing release/IA documentation, existing video lookup/presentation/static-params, their targeted tests, one candidate release record and (after preview acceptance) catalog/registry and exact hash-named MP4.

Impact review: additive standalone type and detail projection only; no new analytics, privacy data, AI behavior, services, hosting, dependencies or changes to existing videos. Update the runtime strict schema and matching release validator together. Preserve budgets, immutable bytes, Access-protected noindex preview, per-video owner acceptance, human exact-current-head GitHub acknowledgement, technical/security review, mandatory CI, separate production authorization and normal main deployment. Public PRs may contain governance/code and a pending candidate manifest before acceptance, but no unaccepted MP4 or fabricated ACTIVE/publication evidence. Complete the same PR after acceptance.

Acceptance: Chinese reading-notes resolve through the existing detail route/player; wrong-type destinations, unsafe paths, wrong locale and stale fingerprints fail closed; existing videos retain their bindings. Run configured mandatory checks once for each changed final head, build/static-export validation, then verify accepted media hash and public playback after authorized deployment. Existing completed source media verification is reused.
