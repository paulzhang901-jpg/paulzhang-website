# Phase 6D.6C — post-merge security remediation

Classification: ARCHITECTURE-COMPLIANT IMPLEMENTATION under Accepted ADR-0032.
Owner: Paul Zhang. Goal: close F-01 through F-04 from the Phase 6D.6B review.
Version boundary: future narration governance, outside the V1 static reading experience.
Repository: paulzhang901-jpg/paulzhang-website.
Base: 803536c2b6026cd2a6f8c04037c1b5194bcb32ec (merged PR #82).
Branch: codex/phase-6d-security-remediation.
Allowed paths: affected governance contracts/service/identity/admin/store, their tests, CI gating and this evidence report. No ADR change or new architecture approval is required.

## Reproduction and fixes

| Finding | Reproduced cause | Targeted remediation |
|---|---|---|
| F-01 audit provenance | The transaction wrapper audited its original undefined job argument after submit created or deduplicated a different job. Successful events had null job ID and binding. | Resolve the returned job ID to the actual durable record before committing. New events contain exact job ID, immutable SourceRef and hashed source/voice/asset binding. Deduplicated submissions preserve creator/source identity and record the requesting actor and existing state. |
| F-02 actor attribution | The failure path hard-coded `unverified` after both authenticated role denials and business failures. | Separate current verified authentication from role authorization. Preserve the verified subject after authentication succeeds. Persist bounded authentication/authorization/business denial codes; forged contexts remain unverified. No token or arbitrary exception text is stored. |
| F-03 expired final attempt | Claim refused attempt 3, fail required a live lease, and recover rejected exhausted attempts, leaving an interrupted final claim in DRAFT. | Add authorized `reconcile` service/admin action. Expired mock leases release reservations, increment the fence and clear ownership in the same transaction as audit/replay state. Non-final attempts remain retryable; exhausted jobs become FAILED. Distinct repeated reconciliations are harmless no-ops; reusing a successful request is rejected as replay. Active leases and unauthorized actors are rejected. |
| F-04 CI tests | The required application job ran individual suites but omitted narration governance. | Add `pnpm run test:narration-governance` as an unconditional step in the required application job. Existing `validate` dependency and failure aggregation make suite failure block success. Architecture and deployment gates remain unchanged. |

F-03 concurrency testing also exposed an existing snapshot race: separate operational/audit SELECTs could straddle another process's commit and falsely report INTEGRITY. Store snapshots now use one SQLite read transaction, reusing an existing write transaction when present. This directly supports safe competing claims/reconciliation; no audit integrity check was relaxed.

Audit enrichment is backward-compatible for reading historical events: SourceRef and denial reason are optional in the runtime schema, while all new job events populate provenance. Existing event bytes/hashes and append-only records are not rewritten. A regression opens a ledger with a legacy event, appends a new enriched submission and verifies the old hash survives restart.

## Acceptance and executed evidence

New tests were run against the original implementation first and exposed missing provenance/attribution, unavailable reconciliation and missing CI gating. Final validation uses Node v24.19.0 and pinned pnpm 11.19.0.

- `pnpm typecheck`: PASS.
- `pnpm lint`: PASS.
- `pnpm test`: PASS, 211 tests: all 201 existing cases plus nine remediation regressions and one CI-gating regression.
- `pnpm test:narration-governance`: PASS, all 19 cases. Tests cover created/deduplicated provenance, role denial and revoked role grants, forged contexts, authenticated business failures, expired retry release, active-lease/unauthorized reconciliation, SIGKILL of an independently running final worker, stale completion/publication denial, replay/idempotency, restart durability, two competing reconcilers, legacy audit hashes, and snapshots during another process's audit writes.
- Security and media suites: PASS as part of the full suite. The staged-file secret scan is rerun before commit.
- `pnpm validate:architecture`: PASS (18 routes, 39 events, 8 states).
- Workflow YAML parsed with PyYAML BaseLoader; the unconditional governance step belongs to the application job required by validate, whose failure aggregation exits nonzero. CI-gating regression: PASS.
- `pnpm build --webpack`: PASS, with TypeScript enabled and unchanged static export configuration. This is the supported validation path established in Phase 6D.6A for the local Turbopack worker restriction; repository/CI default build commands remain unchanged.
- `pnpm validate:static-export`: PASS, 324/324 production routes, valid canonical/hreflang and sitemap/robots, no broken internal links or runtime image-optimizer URLs, public/private boundary passes.
- Route comparison: the 320 HTML files exactly match the pre-remediation inventory; Chinese and English roots and existing routes remain intact.

## Safety, scope and remaining deployment prerequisites

`productionTtsEnabled=false`, `costAuthorized=false`, `maxSpendUsd=0` remain unchanged. No paid calls, new dependencies, provider activation, Cloudflare resources, public narration, deployment, merge or auto-merge. Published articles, navigation, public layouts, Phase 6C snapshots and website analytics are untouched. Audit records contain only governed identities/provenance and bounded reason codes, excluding JWTs, source prose and private ministry submissions.

Reconciliation is an available protected operator/scheduler boundary; no scheduler or production administration runtime is provisioned. Mock attempts settle zero actual usage. Real paid-attempt accounting/reconciliation, selected live identity/storage providers, independently retained protected audit exports, retention policy, broader separation-of-duties policy, authorized publication/withdrawal and bilingual device/listening validation remain separate production prerequisites. Hash chains and SQLite triggers are not proof against a database administrator rewriting the entire store.

This PR requests Paul security review of the four fixes. It does not authorize merge, deployment or narration activation.
