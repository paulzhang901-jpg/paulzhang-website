# Phase 8A.1 architecture proposal evidence

Status: PROPOSED / NOT APPROVED / NOT MERGED. No media uploads, runtime video catalog changes, media generation or production deployment.
Base: a814c7ba171de8c57d3c27fbcdcd1e5938c2e59b. Isolated branch: feature/video-publishing-policy. Original Phase 7 checkout preserved.

## Scope

ADR-0037 proposes a standing delivery/budget workflow rather than per-sermon exceptions. Existing ADR-0033/0036 assets and decisions remain unchanged. Empty non-runtime registry, declarative schema and fail-closed validator are proposed together. ADR activation requires reviewed acceptance; metadata is not identity proof. Actual Access verification, human iPhone acceptance, authenticated human exact-head acknowledgement, eligible independent GitHub approvals and explicit production permission remain external gates.

## Local validation

- Complete configured package test sequence: PASS, all test groups exit 0.
- Architecture, media budget/policy, security, routing/content/translation/product/accessibility/media/narration-governance tests: PASS.
- Policy/performance group: 15 tests PASS, including activation refusal, tampering, unsafe paths, missing locale/acceptance, stale source, runtime association, retirement/replacement, unregistered small/external video rejection and exact legacy grandfathering.
- ESLint with zero warnings; strict TypeScript: PASS.
- Content validation: PASS, 81 items, 85 existing optional-field/translation warnings; content untouched.
- Local Next.js build using existing dependencies and --webpack: PASS. Standard CI build remains unchanged and must pass on PR head.
- Static export validation: PASS, 332/332 production routes, zero broken internal links, canonical/hreflang and public/private boundary PASS.
- Independent Code Reviewer agent: two P2 findings (retirement lifecycle and reverse registry coverage) fixed and re-reviewed; no remaining scoped actionable findings. This is technical review, not owner acceptance or a GitHub approval review.

## Preservation and handoff

No MP3, MP4, SRT, original article, published video, source narration catalog or Mac Studio project is modified or included in this architecture PR. Existing completed media checks are reused. Knowledge and Wisdom remains a later separate publication change, after architecture approval/merge. Do not misstate previously unresolved spoken-word/timing items as independently listening-certified.

Git object-store measurement at proposal preparation: loose size 98,988 KiB, pack size 119,756 KiB (below proposed 512-MiB operator review ceiling). A preexisting shared-repository garbage warning was observed; no cleanup, prune or history rewrite performed. Proposed cumulative media budget includes old immutable assets.

Next: obtain required architecture reviews, record acceptance without self-approval, require final-head CI and owner-authorized merge. Then resume protected preview work under the accepted policy; stop for the specific iPhone acceptance before any production publication.
