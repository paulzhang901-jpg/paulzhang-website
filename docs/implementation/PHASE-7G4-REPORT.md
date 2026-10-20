# Phase 7G.4 — True Faith production candidate
Date: 2026-10-19
Owner: Paul Zhang
Scope: V1, architecture-compliant implementation of accepted ADR-0036.
Deployment: NOT PERFORMED — mandatory final-head gates remain pending.

## Authorization and preservation
Paul's Phase 7G.4 instruction explicitly authorizes this article's review-to-published transition, required PR/CI/hosting/rollback preparation and conditional production deployment. The guarded transition succeeded on codex/phase-7e-faith-publication-prep. No production deployment, main merge or final authenticated owner review is inferred.
The two approved bodies and ten approved web media files remain byte-identical. No generation, rewriting, provider call, voice/model change, new paid service, DNS/Access change or workflow/security bypass.

## Source and media identity
Source snapshot commit: 7e8b8e03838d8f07d483918972c01374b4b6586e.
- zh-CN published MDX SHA-256: 5040eba91deba1377e99d7c25621b1105429fd10173b8654aff553a78fe1b446.
- en-US published MDX SHA-256: 879f4483ce25f84100f5782f3a548f541b403f5d7212c1f0468f30318ad9d4f4.
Approved original body/media identities are retained in the unchanged Phase 7G.1 candidate manifest, SHA-256 67d156a69cd95234a492041959b6a146e4b688711b6e9c0548ecf8a08e1fc630.
Final candidate manifest: config/media-publishing/releases/what-is-true-faith.json. Runtime catalog PUBLISHED labels describe what the proposed main release will serve, not proof that production has deployed.
Track only ten exact same-origin hash-named web assets, 39,408,920 bytes; four exact over-1-MiB size/hash exceptions, no directory exemption. Media are served from the ordinary Pages export, not the temporary preview host.
Legacy voiceConfigSha256 identifies only the explicitly labelled verified provider/profile descriptor. Full historical generation settings remain unknown. Preview fixture events/hashes are not copied.

## Remaining release checklist
- [x] Owner mechanism and exact publication-transition authorization.
- [x] Approved body/media bytes and current published MDX hashes verified.
- [x] Immutable source snapshot and genuine release-event identity recorded.
- [x] Focused media/content/accessibility boundary tests: 13/13 PASS.
- [x] Existing frozen install, architecture, lint, typecheck, configured test groups, content/fiction validation, normal build and static export: PASS. Export 332/332 routes; zero broken internal links; canonical/hreflang/sitemap/public-private boundaries PASS.
- [x] Independent technical/security review: GO, no critical/important findings; media hashes, unchanged prior narration records and source snapshot independently checked. One stale comment corrected; generated-artifact ESLint exclusion and approved navigation-test delta independently reviewed GO.
- [ ] One scoped PR and required CI checks at exact final head.
- [ ] Authenticated Paul review of exact final source/media bindings, and final confirmation after head/checks are reviewable (ADR-0036).
- [ ] Protected main merge and existing main-only production CI deployment.
- [ ] Live bilingual article/audio/download/video/captions/mobile/SEO verification.
- [ ] Existing Obsidian exact-body archive verification.

## Production hosting and rollback
Existing normal workflow only: GitHub main push -> four groups + validate -> production build/validate -> Pages project paulzhang-website-preview, branch production; no feature-branch direct upload. Existing secrets remain confined to production job.
Rollback baseline retained: deployment c302757a-5ebe-4591-baa6-528879a5d917, source 46af9979efa31ae9e19d4dea293481ef91d01786. Recheck actual deployment/source just before release. If delivery fails, halt completion and use an authorized immutable deployment rollback or scoped reviewed revert PR with all gates; never reset main or alter unrelated content. Retain all masters and audit history.

## Target production routes — pending deployment verification
- https://paulzhang.org/library/what-is-true-faith
- https://paulzhang.org/en/library/what-is-true-faith
- https://paulzhang.org/videos/what-is-true-faith
- https://paulzhang.org/en/videos/what-is-true-faith

## Delivery contract
Goal: release only the approved bilingual article/media through established workflow. Allowed paths: ADR-0036/index/release notes, exact article metadata/bindings/assets/budgets/tests, previously approved required video integration and related historical preparation records. No unrelated article changes.
Analytics/privacy impact: no new analytics collection, private data or credentials. ADR impact: implements only accepted bounded ADR-0036; prior accepted decisions are preserved.
Final-head CI/review and eventual deployment evidence belong to the PR and post-release record; do not mark them complete merely because this local report exists.

## Local preparation findings resolved
The host had no pnpm shell shim; enabled the existing Corepack shim only in /tmp/faith-7g4-bin (pnpm 11.19.0, Node 24.18.0). ESLint initially scanned Git-ignored preview build copies; excluded only artifacts/local-publication/** while keeping website source rules. An old navigation assertion omitted ADR-0034's approved Videos entry; updated its exact list without changing navigation. Normal local gates then passed. Git fetch initially waited on the default osxkeychain helper; per-command official gh auth git-credential helper succeeded without extracting or displaying credentials. No permanent Git credential configuration changed.
Media/export readiness: all ten candidate export files match approved hashes/sizes and are below the existing Pages per-file limit; bilingual H1/canonical/locale navigation/media/caption/download/AI-disclosure bindings pass, no preview label or article noindex. This is predeployment artifact evidence, not live playback.
Fresh read-only Pages listing confirms rollback baseline c302757a-5ebe-4591-baa6-528879a5d917 / source 46af997. Previous candidate/preparation reports remain historical and intentionally show their prior blocked states.

## Verified PR scope after staging review
The broad initial staging request was rejected by automatic approval review; no files were staged by that request. The narrower selection below follows direct diff inspection against origin/main 46af997 and independent review. It excludes the local preview generation/server scripts, historical Phase 7A/B/E/F/G/G2/G3 reports and the historical preview-only change to STATIC_PRODUCTION_DEPLOYMENT.md; those are preserved unstaged, not deleted.
- Two article headers/bodies and ten media: exact approved release, already source-snapshotted; no other article path differs from production.
- ADR-0034/0035/0036 and ADR index, route/content/release architecture notes, IA/routes registry: required governance dependencies for the existing bilingual video surfaces explicitly retained by ADR-0036; no new unrelated architecture decision.
- Existing video listing/detail components and routes, bilingual labels/routing/header/sitemap and normal export placeholder handling: necessary to serve this article's approved videos under the already approved discovery integration. No other feature added or removed.
- Narration/video catalogs and four article-specific release manifests: only this identity is added; old narration rows unchanged, earlier preparation states retained as historical evidence.
- Exact performance entries, content/video/navigation tests and package test registration: enforce approved bytes, public/private boundaries and the already approved Videos navigation order.
- .gitignore, tsconfig and ESLint narrow local-publication exclusion: isolate ignored preview build copies from normal source checks; no source rule suppressed, no generated fixture committed.
- This Phase 7G.4 report: current release/audit/rollback evidence only.
The current main deployment workflow, existing hosting/security settings, unrelated manuscripts and permanent taxonomies remain unchanged. Do not infer authorization to stage other worktree paths.


