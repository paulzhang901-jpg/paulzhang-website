# ADR-0032 — Production Narration Governance

Status: Proposed — Awaiting Paul Approval
Date: 2026-10-12
Scope: Future production narration governance (not production activation)
Decision owner: Paul Zhang

## Context
ADR-0030 and ADR-0031 provide offline, opt-in narration infrastructure with local mock generation. The existing Next.js site is statically exported to Cloudflare Pages. No server-side authentication, production TTS, durable jobs, private production media store, or authenticated publication authority is presently provided by that foundation.

The proposed governance plane is an **architecture change** under `AGENTS.md` and `docs/architecture/ARCHITECTURE.md` because it changes identity, privacy, AI, and release boundaries. This ADR does not amend the accepted static production deployment contract and does not itself authorize implementation or activation.

## Problem statement
Local manifest integrity and simulated review cannot establish genuine human identity, source authenticity, non-repudiation, or authorization to incur costs or publish. Production generation needs enforceable security, provenance, durable accounting, and separate human publication approval.

## Proposed architecture decision
1. Keep canonical bilingual published MDX in GitHub as authoritative source. Treat snapshots and manifests as untrusted until independently reconciled against an approved source commit and extracted article bytes.
2. Retain the static website and existing GitHub Actions → Cloudflare Pages deployment path. Place authenticated operations in a separately protected administration service, not in static client code or publicly writable endpoints.
3. Use a least-privilege identity provider with verified sessions and server-side RBAC. Suggested roles: Generator (request generation), Reviewer (review exact asset), Publisher (authorize publication of an already approved asset), Administrator (manage access/budget, not bypass content approval). Role possession does not automatically advance workflow state.
4. Enforce a server-side, durable state machine: DRAFT → GENERATED → PENDING_REVIEW → APPROVED → PUBLISHED, with REJECTED, FAILED and STALE transitions. Never translate simulated local approval into production approval.
5. Bind each review to `canonical_id`, `locale`, `source_sha256`, `voice_config_sha256`, `audio_sha256`, `narration_version`, `reviewer_subject`, and approval timestamp. Require fresh authoritative-source validation at review and again at publication. Reject stale content or mismatched provenance.
6. Implement durable idempotent jobs with atomic claims, lease/fencing tokens, retries, reconciliation, and cross-process duplicate prevention. Each generation attempt has an immutable job ID and audit trail.
7. Default all production generation and spending to disabled. Require separate owner approval of provider, credentials, spend cap and activation. Use transactional per-job budget reservation, actual usage settlement, failure reconciliation, and hard limits; enforce a provider-side spending limit where available.
8. Keep candidate media in private object storage with no public listing. Use content-addressed object keys and server-validated immutable asset identities; publish only through a separately authorized promotion step after verifying hashes, current source, approvals, and object permissions. Prevent overwriting published objects. Define revocation and rollback procedures.
9. Write structured, access-controlled, append-only audit events recording actor, action, request ID, job, asset, source/config/audio hashes, transition, timestamp, authorization outcome and policy version. Separate mutable operational tables from tamper-evident audit exports/retention; a database alone is not a cryptographic proof of authenticity.
10. Exclude raw prayer, grief, family, counseling and companionship data from logs and analytics. Keep production keys server-side; never expose them to client bundles, PR jobs, or manifests. Review retention, access, breach response and vendor processing before production use.
11. AI audio must be disclosed as synthetic narration and never represented as Paul's recorded voice. Chinese and English assets require independent human listening for pronunciation, completeness and theological fidelity. No automatic subtitle timing fabrication.
12. No production narration, publication, API spend, R2 creation, new credentials, or hosting change is authorized by this Proposed ADR.

## Authentication and authorization
Authenticate server-side with verified token issuer, audience, expiration, signature, session revocation and least-privilege service identity. Require explicit action-specific authorization for each state transition; defend against replay with unique request IDs and atomic compare-and-set. One individual may hold multiple roles in a small operation, but must perform distinct review and publication acts with separately recorded authorization; approval cannot be inferred from generation. Any stronger separation-of-duties policy requires owner approval before activation.

## Auditability and source integrity
Store review and publication decisions independently of caller-supplied manifests. Persist immutable actor subject IDs and approved asset hashes. A protected audit service or independently retained append-only export is required before activation. Recheck current authoritative GitHub MDX on both review and publish; hash and parser normalization policy must be versioned. Content updates invalidate dependent approvals and mark assets STALE.

## Alternatives considered
- GitHub Actions + GitHub Environments: reuse existing permissions and review UI, but workflow identities, durable queues and fine-grained audit coupling are harder; viable for a constrained later evaluation.
- Cloudflare Access + Workers + D1 + private R2: integrated identity gateway and serverless controls, but JWT verification, authorization and atomic D1 job/cost design remain necessary. **Candidate, not yet a selected vendor commitment.**
- Independent identity service and database: flexible but increases operations, security review and cost.
- Continue local-only mock tools: safest now but cannot support production publication.
- Client-side API keys or client-only approval flags: rejected as insecure.

## Consequences and security boundaries
A separately authenticated production governance plane introduces operational complexity, identity management, data retention and vendor costs. These are acceptable only after an explicit owner decision and independent security review. Static page delivery remains unchanged. A mock state history, hash match or local reviewer allowlist is never a production authorization.

## Implementation dependencies
- Phase 6D.2: schemas, state transitions, permission contracts, source binding, audit/cost interfaces, negative tests.
- Phase 6D.3: authenticated admin entry point, identity verification, RBAC and protected review actions.
- Phase 6D.4: durable jobs, idempotency, budget reservation/settlement, audit persistence and concurrency tests.
- Phase 6D.5: private asset lifecycle, provenance, publication gate, stale invalidation and rollback.
Parallelize contract-compatible components; require independent security validation before any production integration.

## Production activation requirements
Separate Paul approval is required for: accepting this ADR; selected identity and infrastructure providers; production credentials; any paid service and budget; private storage creation; publication permissions; final merge where policy requires; and explicit production activation. Independent tests must cover forged identity, replay, forged approval, stale source, hash mismatch, duplicate jobs, race conditions, budget overrun, unauthorized publication, object ACL leakage and audit tampering. Verify actual iPhone playback and independent Chinese/English listening before public release.

## Supersedes
None. ADR-0030 and ADR-0031 remain unchanged.

## Superseded By
None.
