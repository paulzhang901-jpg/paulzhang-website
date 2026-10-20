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

## Proposed amendment — protected-preview HTTP Range delivery

Status: PROPOSED / NOT ACCEPTED. The accepted decision above remains unchanged. This amendment is retained in existing PR #91; no additional PR is required. Classification: ARCHITECTURE CHANGE, V1. Owner: Paul Zhang.

### Explicit conflict and evidence

The accepted decision prohibits runtime service and deployment workflow changes and retains static Pages media. Authenticated candidate GET Range requests demonstrably return full-file 200, with valid Content-Length but no Content-Range. Both native players expose seekable [[0,0]]. Approved faststart media must remain byte-identical. Cloudflare's Serving Pages documentation currently describes 200 responses to Range requests: https://developers.cloudflare.com/pages/configuration/serving-pages/#behavior. Existing public-domain 206 control evidence remains valid; this amendment does not claim every Pages deployment ignores Range. No supported static-only configuration remedy has been identified for this protected preview. Setting Accept-Ranges alone does not implement partial responses.

### Proposed bounded exception

Permit one same-origin, dependency-free Pages Function only on the existing protected preview project's non-production candidate branch, limited to exact MP4 paths declared in the candidate release manifest. Keep every other route on static delivery. Reuse the deployment's existing asset binding; no R2 bucket, separate Worker service, new host, DNS change, paid service, secret, authentication bypass or media copy/transformation. The HTML5 player, canonical model, article/audio/subtitle bytes and all current release budgets remain unchanged.

The handler must implement real single-byte-range GET responses (closed, open-ended and suffix ranges) with 206, correct Content-Range, matching Content-Length and exact bytes from the immutable asset. Unsatisfiable single ranges return 416 with bytes */size. Malformed/multipart requests follow documented HTTP-compliant full-response behavior; If-Range mismatches return the complete representation. Ordinary GET and HEAD preserve correct representation metadata. Do not attach a false 206/header to an untrimmed full body. Bound memory and cancellation; do not buffer all videos or permit arbitrary upstream URLs. Preserve security/noindex headers explicitly because static _headers do not automatically govern Function responses. No request bodies, cookies, tokens or personal data may be logged or exported. Do not add shared caching of authenticated responses.

Cloudflare Access must remain in front of both pages and exact media paths on the deployment URL and branch alias. Verify anonymous denial/Access redirect before and after upload. If this cannot be demonstrated, stop without deployment. No Access settings are changed.

### Approval, scope and acceptance gates

This proposal is review material, not authorization to implement or deploy a Function. After explicit owner acceptance and the required architecture review, record that decision and update the delivery contract before implementation. Allowed implementation paths are the scoped preview Function/helper, range tests, preview-only routing/deploy preparation and this release's evidence; production CI and public catalogs are excluded. Do not merge this proposal/preparation PR into main while it contains an unaccepted publication candidate. No production Function or production workflow change is authorized by this preview-only amendment; any production delivery requirement must be reviewed separately.

Required validation: exact byte checks for first, middle, end, suffix/open-ended and invalid ranges; GET/HEAD/If-Range behavior; allowlist/path traversal and upstream failure tests; unaffected static-route/header checks; anonymous Access denial for both HTML and media; authenticated 206 and Content-Range for both MP4s; actual native seeking 60→180→480 seconds in both languages; owner iPhone acceptance of the exact corrected preview. Preserve current MP4/SRT/VTT/poster hashes. Analytics impact: none. Privacy impact: same Access boundary, no new logs/cookies/analytics. Rollback: restore the previous immutable protected static preview without touching approved media or production.
