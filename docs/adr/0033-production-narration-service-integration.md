# ADR-0033 — Production Narration Service Integration

Status: Proposed
Date: 2026-10-12
Decision owner: Paul Zhang
Approval record: None. Recommendations below are not authorizations.
Classification: ARCHITECTURE CHANGE.
Scope: future narration integration / V1.5 operational identity; no public V1 feature activation.

## Context

Accepted ADR-0032 and merged PRs #82/#83 established offline governance and remediated audit provenance, actor attribution, exhausted lease recovery and required CI coverage. Phase 6E.1 found that live identity, async durable services, real paid accounting, private object delivery, independent audit and incident operations still require explicit decisions. Baseline main is `765190418303c0fff5558d316fab8d106e01ea30`.

The repository retains Next.js static export and Accepted ADR-0021's automatic validated main-only Pages deployment. Adding authenticated narration services changes identity, privacy, AI and release boundaries, requiring a follow-up ADR. 0033 is the next unused number in freshly fetched main; recheck before merge. Accepted ADRs remain unchanged.

## Decision — proposed, awaiting Paul

Recommend the separate Cloudflare stack and the concrete A–L controls in the [Phase 6E proposal](../architecture/PHASE_6E_PRODUCTION_ARCHITECTURE_PROPOSAL.md). Retain the static frontend. Use distinct Workers administration/execution/delivery services, D1 conditional atomic commands, Queues as idempotent notifications, private immutable R2 and Access backed by selected OIDC/MFA with live application authorization. Choose OpenAI TTS only after owner-approved model, bilingual voices, processing terms, price and usage reconciliation.

Require renewable leases, monotonically increasing fencing and a persistent paid-attempt barrier. An ambiguous request is UNKNOWN, not free failure; retain its conservative reservation and prohibit automatic paid replacement. Reserve and settle integer monetary bounds atomically with job/audit/outbox. If D1 cannot prove required transaction semantics, stop for an alternate approved persistence decision.

Fetch and validate canonical Git source outside database writes, then compare source generation, hashes and job versions atomically. A post-commit source check precedes exposure; delivery revalidates authority and fails closed. A cross-provider source race cannot be eliminated by claiming atomicity. Paul must accept its measured SLA or approve coordinated release changes.

Require authenticated human review of exact zh-CN and en-US assets independently. Propose reviewer different from submitter and executing human; reviewer may separately perform publication if Paul approves small-team policy. Service identities cannot review/publish. Keep media private behind a gateway; initially bypass shared CDN caches and recheck active publication for each request. Withdrawal first tombstones authority, then purges as defense in depth; downloaded/in-flight bytes cannot be recalled.

Independently retain signed contiguous audit checkpoints in a separate security account/custodian with approved retention and tested administrative powers. Block dispatch/publication for gaps or excessive export lag. Restore with execution/publication disabled, new environment epoch, fenced leases and provider liabilities reconciled. No automatic provider or outbox replay after database rollback.

## Alternatives Considered

- Managed Node + PostgreSQL + private object store: easier synchronous library reuse and transaction model, more runtime/patching operations; preferred fallback if Cloudflare proof fails.
- GitHub Actions/Environments for constrained batch operation: familiar human gates but weak fit for continuous lease/accounting/private review and fine-grained audit.
- Durable Objects or Workflows coordinator: potentially useful but extra service semantics and cost; evaluate through an explicit amendment rather than silently add.
- Direct OIDC backend sessions: valid alternative to Access gateway, with additional session/CSRF/rotation responsibility.
- Continue mock-only: approved and safe default until all gates pass.
- Public bucket, browser keys, self-asserted review, presumed exactly-once billing: rejected.

## Security Implications

Preserve F-01–F-04 as regression obligations. Authentication, application RBAC and current sessions are checked at each action; verified denied actors remain attributable. Production service identities have no human approvals. SQL guards, idempotency, reservations, fencing and audit commit atomically; external provider/object/promotion steps use explicit recovery states and outbox. Independent security review must inspect actual implementation and selected-platform evidence, including stale workers, conflicting recovery and provider timeout.

## Privacy Implications

Only approved published canonical MDX may enter TTS. Exclude prayer, grief, family, counseling, companionship and reflection submissions from narration, diagnostics and analytics. Do not log raw JWTs, secrets, source prose or arbitrary rejection text. Choose vendor processing, residency, retention/deletion and access rules before provisioning. Proposed 12-month audit retention is not approved. Synthetic disclosure must be accurate in both languages; never imply Paul's recorded voice or pastoral authority.

## Cost Implications

See the proposal's 10/50/200-article scenarios and separate TTS/compute/database/queue/storage/delivery/audit/monitoring estimates. Official Cloudflare rate sources are dated 2026-10-12; TTS minutes rate and operational allowances are explicitly unverified. Traffic, retained versions, retries, seat/support requirements and human review affect totals. Minutes estimates cannot enforce hard paid caps. No spend is authorized by acceptance or merge of this document.

## Operational Consequences

Requires owner-approved operators, second reviewer, monitoring, source watcher, heartbeat/sweeper, billing incident procedures, independent audit collector, backups and restore drills. Proposed RPO one hour/RTO four hours and initial lease/heartbeat settings require owner confirmation and measurement. Queue is at-least-once; D1 is operational authority, not an external billing or tamper-proof authority. Backend credentials and releases must remain separate from the existing Pages workflow; mainland-China reach is not guaranteed.

## Rollback Strategy

Disable dispatch and publication first, pause consumers, retain UNKNOWN reservations and audit evidence. Tombstone assets before cleanup. Roll back a compatible Worker artifact only after schema compatibility checks; do not undo charges or restore older permissions implicitly. Restore isolated D1/object state, verify independent checkpoints and invoices, fence prior workers with a new epoch, and require human approval before reopening. Existing static Pages remains on its current accepted release path.

## Implementation Boundaries

This ADR remains Proposed. This documentation-only PR adds no routes, schemas, registries, dependencies, runtime/configuration or workflows. Proposed architectural references are labeled accordingly; accepted specs are not rewritten to presume approval. After acceptance, update affected architecture contracts and registries/schemas in the same approved implementation reviews before behavior changes. Implement Phase 6E.2–6E.5 only under a subsequent explicit scoped owner instruction. No backend auto-deploy extension of ADR-0021.

## Explicit Owner Approval Requirements

1. Architecture selection, D1 proof obligations, identity issuer, stronger role separation and operator assignments.
2. Resource/region inventory, least-privilege permissions, independent audit custodian/retention and recovery targets.
3. Provider/model/voices, processing terms, verified prices and bounded billing reconciliation.
4. Separate infrastructure, credentials, backend deployment and numeric spending/paid-canary authorization.
5. Publication delivery/withdrawal SLA, residual source race and per-locale release policy.
6. Phase implementation scope and merges, independent security acceptance and final production generation/publication activation.

ADR acceptance or documentation merge does not authorize any items in 4 or 6. Preserve `productionTtsEnabled=false`, `costAuthorized=false`, `maxSpendUsd=0` until a separately authorized and independently validated activation change.

## Supersedes

None. Supplements ADR-0032 without reopening completed Phase 6D approval. ADR-0015 hosting and ADR-0021 static deployment remain unchanged.

## Superseded By

None.
