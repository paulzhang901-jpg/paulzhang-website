# Phase 6D.1A — Architecture Conflict Matrix

Status: Review draft — not authorization to implement
Baseline: `a895ba169d2b54120df46dd62cbcd4524c061f7e` (PR #80 merged)

## Governing references (line numbers are 1-based in baseline files)
- `AGENTS.md:3-10`: mandatory product/architecture reading and classification.
- `AGENTS.md:12-16`: identity, privacy, AI, release changes require ADR before implementation.
- `AGENTS.md:18-30`: conflict protocol, canonical content, AI limits and sensitive privacy boundaries.
- `AGENTS.md:32-36`: READY and DONE gates.
- `docs/architecture/ARCHITECTURE.md:3-13`: accepted ADR authority hierarchy.
- `docs/architecture/ARCHITECTURE.md:29-31`: change control.
- `docs/adr/README.md:3-9`: ADR status, approval and immutability.
- `docs/adr/0030-ai-audio-video-publishing.md:5-15`: offline-only, immutable source, human review, no paid production activation.
- `docs/adr/0030-ai-audio-video-publishing.md:19-22`: trusted-local boundary.
- `docs/adr/0031-offline-production-narration-foundation.md:6-20`: mock-only simulated review, disabled paid generation, missing production prerequisites.
- `docs/adr/0031-offline-production-narration-foundation.md:22-34`: untrusted manifest and no authenticated production authorization.
- `docs/architecture/PRIVACY_MODEL.md:3-18`: sensitive data separation and consent.
- `docs/architecture/AI_BOUNDARIES.md:3-9`: AI does not replace human ministry.
- `docs/architecture/STATIC_PRODUCTION_DEPLOYMENT.md:3-35`: static export, deployment and secrets boundaries.

## Classification
A = already permitted; B = additional ADR required; C = explicit owner authorization required; D = conflicts with binding architecture; E = unsafe until prerequisites exist.

| Proposal | Class | Existing boundary | Resolution |
|---|---|---|---|
| Keep deterministic MDX snapshots and local mock tests | A | ADR-0031 offline trust boundary | Preserve unchanged |
| Write governance schemas and negative tests without live integrations | A/B | Architecture change rule for identity/privacy/release | Proceed only after ADR accepted if implementing new binding contracts |
| Authenticated admin API and RBAC | B,C | No existing production identity plane; static website | ADR-0032 approval and selected service boundary |
| Genuine reviewer approval | B,C,E | Caller-supplied reviewers are simulation only | Verify identity, protected decision and exact source/asset |
| Durable jobs and audit store | B,C,E | Local files/process-local locks only | Atomic state, persistence, audit and retention policy |
| Paid TTS and provider secrets | B,C,E | Disabled, spend limit zero | Separate budget, provider, credential and activation approvals |
| Private R2 candidate assets | B,C,E | No R2 resource exists or is authorized | Approved storage architecture, ACLs and rollback |
| Public narration publication | B,C,E | Mock PUBLISHED prohibited; source authenticity not proven | Independent publication gate and production security review |
| Replace existing static export with dynamic Next.js hosting | D | ADR-0015/0021 and static deployment contract | Not proposed; retain static hosting |
| Treat SHA consistency or simulated APPROVED as authenticated approval | D,E | ADR-0031 explicit non-authenticity | Forbidden |
| Add AI voice playback as replacement for human companionship | D | AI boundaries and North Star | Forbidden |

## Architecture conflict protocol
ARCHITECTURE CONFLICT
Requested behavior: Enable production narration management, paid generation and publication using current offline mock infrastructure.
Conflicting architecture: ADR-0030/0031 prohibit interpreting simulated review as production authorization; static site has no authenticated admin runtime.
Relevant file / ADR: `AGENTS.md`; `docs/architecture/ARCHITECTURE.md`; ADR-0030; ADR-0031; static deployment contract.
Impact: Unauthorized spend, forged approval, source drift, public asset leakage and release-boundary violations.
Recommended resolutions:
A. Continue offline-only tests within current architecture.
B. Approve ADR-0032 and implement a separately protected governance plane.
C. Defer production activation until security, privacy, budget and playback evidence exist.

## Owner decisions required
1. Accept/revise/reject ADR-0032 (currently Proposed).
2. Choose or defer identity gateway, admin runtime, durable store and private storage vendor.
3. Confirm reviewer/publisher separation policy and audit retention.
4. Set a separately authorized nonzero production budget, if and when desired.
5. Approve credentials, resources and production activation in separate explicit actions.

This document does not constitute owner approval.
