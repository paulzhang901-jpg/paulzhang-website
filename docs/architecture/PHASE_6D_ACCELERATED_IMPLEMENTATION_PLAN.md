# Phase 6D.1A — Accelerated Implementation Plan

Status: Proposed plan only — no Phase 6D.2–6D.5 authorization
Baseline: PR #80 / `a895ba169d2b54120df46dd62cbcd4524c061f7e`
Dependency: ADR-0032 must be accepted before architecture-changing implementation.

## Acceleration principle
One owner architecture decision, then contract-first parallel workstreams with independent security verification. Avoid owner approval for ordinary compliant implementation details. Preserve separate owner approvals for paid spend, credentials, resources, architecture changes, production activation and policy-required merge.

| Phase | Deliverable | Dependencies | Parallel work | Gate |
|---|---|---|---|---|
| 6D.2 Governance contracts | Canonical source/asset identity, typed RBAC actions, state machine, audit event schema, cost ledger and publication invariants | Accepted ADR-0032 | Contract schemas, threat modeling and negative tests | Architecture/schema tests and owner-approved boundary |
| 6D.3 Authenticated administration | Verified session/identity adapter, server-side RBAC, explicit review actions, protected admin entry | 6D.2 interface freeze | Identity service and reviewer UI prototype may progress independently | Independent forged-identity/replay/authorization tests |
| 6D.4 Durable jobs and cost controls | Persistent jobs, atomic claims, fencing, retry accounting, budget reserve/settle, audit retention | 6D.2 interface freeze; selected infrastructure | Queue, ledger and append-only audit implementation | Race/failure injection and zero-spend default |
| 6D.5 Private asset governance | Candidate private media, provenance validation, STALE invalidation, controlled publication and rollback | 6D.2 contracts; 6D.3 authorization; 6D.4 durable state | Storage adapter and immutable object tests can start in parallel | ACL/source revalidation, independent security review |

## Shared interfaces
- `SourceRef`: canonical_id, locale, authoritative Git commit, parser version, source_sha256.
- `NarrationAssetRef`: SourceRef, voice_config_sha256, narration_version, audio_sha256, immutable asset_id.
- `AuthContext`: verified subject, role grants, token provenance, action scope.
- `ReviewDecision`: exact asset/source binding, reviewer subject, timestamp, policy version.
- `JobRecord`: idempotency key, state, lease/fencing token, attempt, immutable request ID.
- `BudgetReservation`: job, provider, cap, reserved/actual amounts, settlement state.
- `AuditEvent`: actor, event, job, asset, old/new state, decision, timestamp, request ID.
- `PublicationGrant`: separately authorized publisher action tied to current source and approved asset.

Interfaces are proposed, not existing production schemas. Versions and migrations require compatibility tests.

## Integration and security checkpoints
1. Accept ADR and freeze shared contracts before code.
2. Build independently testable adapters with all production flags OFF and `maxSpendUsd=0`.
3. Integrate authenticated identity, durable store and private storage only in non-production test environments.
4. Independently test negative paths: forged tokens, caller-injected reviewers, stale MDX, wrong hashes, replay, duplicate jobs, process races, budget exhaustion, unauthorized object access and audit modification.
5. Run repository architecture, content, application, security, static export and privacy checks as applicable.
6. Require explicit owner decisions before provisioning, credentials, paid calls, PR merge where policy requires, and production activation.
7. Before public audio, perform real-device iPhone playback and independent bilingual listening, then explicit publication authorization.

## Version and scope
This is future media infrastructure outside the current V1 static reading experience. No change to article routes, published MDX, canonical taxonomy, website i18n strategy, or existing static deployment workflow is authorized.

## Stop conditions
Any deviation from accepted ADRs, changed main baseline, missing security evidence, unexpected files, nonzero spend, unapproved external resource or accidental production activation: stop and report. No automatic promotion from successful tests to production.

## Current execution boundary
Phase 6D.1A is documentation only. No Phase 6D.2–6D.5 implementation, provider invocation, Cloudflare resource, merge or deployment is part of this PR.
