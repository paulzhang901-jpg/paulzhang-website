# Phase 6E.1A — Production narration architecture proposal

Status: PROPOSED. Owner: Paul Zhang. Date: 2026-10-12.
Classification: ARCHITECTURE CHANGE; decision preparation only.
Goal: add trustworthy bilingual listening to canonical published articles while preserving the path from reading into human relationship and formation.
Version boundary: future narration operations / V1.5 identity infrastructure; no expansion of the V1 public foundation in this PR.
Allowed paths: this proposal, Proposed ADR-0033, ADR index and an explicitly proposed architecture-index reference. No application, configuration, schema, workflow or deployment changes.
References: AGENTS.md; ARCHITECTURE.md; Accepted ADRs 0008, 0009, 0010, 0011, 0015, 0021, 0023, 0032.
Baseline: fetched main `765190418303c0fff5558d316fab8d106e01ea30`; merged PRs #82 and #83. ADR-0032 remains Accepted; the Phase 6D implementation and remediation evidence remain authoritative for that completed scope.

This converts the completed Phase 6E.1 audit into decisions; it does not repeat that audit or imply live services exist. The audit was delivered in the owner conversation, not committed as a standalone repository report. Its relevant constraints are traced to the implementation below. Repository-local ADR numbering ends at 0032 on freshly fetched main; 0033 is available there. Check numbering again before merge if main advances.

## Recommendation and component comparison

Keep Next.js static export and existing GitHub Actions → Cloudflare Pages unchanged. Recommend a separate Cloudflare narration control plane: Access backed by an owner-selected MFA-capable OIDC identity provider, distinct Workers for administration, execution and delivery, D1 for transactional operational records, Queues for wakeups, private R2 for immutable candidate and approved media. Retain audit checkpoints in a separate security account with locked retention and a signing identity unavailable to narration workers. OpenAI TTS is the preferred provider candidate, conditional on model, voice, privacy, cost and billing-recovery approval. No component is authorized or provisioned by this recommendation.

Reasons: fits the existing static Cloudflare delivery boundary, avoids operating a Node server, and supports low-volume pay-per-use services. The benefit depends on passing D1 atomicity, runtime limits, billing uncertainty and independent audit tests. It is not a drop-in port of Phase 6D.

| Component | Compatibility / architecture impact | Security and permissions | Reliability / recovery | Cost and deployment complexity | Alternative |
|---|---|---|---|---|---|
| Static Next.js / Pages | Existing accepted frontend; no SSR, Next API route, Server Action or runtime secret | Keep existing main-only Pages credential boundary | Existing validated artifact rollback; narration outage must not break article reading | Existing site cost excluded; no workflow modification here | Native Next hosting only through a separate future decision |
| Workers | Separate backend, not OpenNext conversion; asynchronous Web APIs | Separate service bindings; executor lacks publication capability; deployment credentials scoped to approved services | Bounded chunk requests, timeout, heartbeat, circuit breaker and version rollback | Paid-plan minimum and usage; medium effort to replace synchronous adapters | Managed Node + PostgreSQL simplifies existing code reuse but adds OS/runtime operations |
| D1 | Normalized relational operations replace local JSON aggregate / node:sqlite | Prepared SQL, constraints, conditional writes, atomic audit and outbox; primary-authoritative security reads | Restore plus external reconciliation; no stale replica authorization | Low expected marginal usage; schema and transaction proof required | PostgreSQL with explicit transactions if D1 proof fails; Durable Objects serialization is a separate design choice |
| Queues | Notification transport, never job or payment authority | Job ID only; consumers reauthenticate and recheck database | At-least-once delivery, deduplication, DLQ, periodic outbox/lease sweeper | Low volume; separate retry and attempt policies | Scheduled polling reduces bindings but increases delay/scanning; Workflows requires separate evaluation |
| R2 Standard | Private immutable objects replace OS files | Public buckets/r2.dev disabled; separate candidate and approved bindings; no list access for browser | Conditional create, checksum, orphan cleanup with retention grace; verified backup | Storage/request costs; promote via outbox, not cross-service transaction | S3 private objects and independently managed retention |
| Access + OIDC | New administration identity, distinct from public visitor identity | Validate signature/issuer/audience/expiry and human identity; live application RBAC; CSRF protection | Rotation/revocation and deny-by-default outage behavior | Seats/IdP terms must be confirmed; medium setup | Direct OIDC with PKCE and secure backend session, greater session-management effort |
| OpenAI TTS | Server-only adapter; approved published text only; locale-specific voice | Project-scoped key only in executor, no client/PR secrets; explicit model/voice allowlist | Unknown billing outcomes quarantined; no assumed API idempotency | Main variable expense; rate/length limits and usage reconciliation must be proved | Another approved TTS vendor; local mock remains default |
| Independent audit | Supplements D1 audit without changing canonical content | Separate account/custodian, retention lock, append-only collector, signing key separate from executor | Ordered sequence verification, signed checkpoints, gap detection and restore cross-check | Separate retention and monitoring quote; higher operational coordination | Independent WORM service; same-account hash chain alone rejected |

Cloudflare global reach does not guarantee mainland-China availability. Test intended regions; do not add China infrastructure by implication. Existing Together Worker/email infrastructure is unrelated and receives no narration privileges.

## Concrete risk mitigation design

### A. Renewable leases and fencing

Persist job version, monotonically increasing fence, lease owner, expiry, attempt ID and attempt state. Use database time, not caller time. Proposed initial lease 120 seconds, heartbeat every 30 seconds, bounded by a per-chunk request deadline and provider limits; tune with tests before activation. Claim atomically checks eligible state, retry cap, authorization, budget and no live owner; increments fence. Heartbeat requires exact owner/fence and unexpired lease. Failure to renew stops further provider submissions immediately.

Every settlement, asset attachment, approval/promotion and terminal update checks expected version/fence. A late result can be recorded as attempt evidence but cannot attach/publish under an expired fence. Sweeper atomically fences expired owners. Known non-chargeable failures may retry; exhausted jobs become FAILED. An in-flight paid attempt becomes UNKNOWN and retains its reservation, even when the job is terminal or its lease expires. Queue retries never create another paid attempt for UNKNOWN work. A stale process cannot be guaranteed to stop an already accepted external request; the persistent attempt barrier prevents a replacement from issuing another one.

### B. Timeout and billing reconciliation

Before network dispatch commit a unique attempt record and reservation; atomically change attempt PREPARED → DISPATCHING with the fence. A crash after this change, even before confirmed send, is conservatively UNKNOWN. Persist available provider request IDs, model revision, chunk hash, duration, response hash and bounded usage evidence. Never persist authorization headers or article text in diagnostic logs.

Disable automatic SDK retries for paid submission. Use an API idempotency key only if the exact speech endpoint provides verified durable idempotency semantics; a request ID alone proves neither deduplication nor billing. Success commits verified usage and object identity. Ambiguous timeout, reset, crash or lost response enters UNKNOWN: keep conservative reserved amount, pause affected job, alert operator. Reconcile against provider usage/billing evidence and support where needed; aggregate billing alone may not identify an attempt. If attribution is unavailable, settle conservatively to the reserved maximum with owner-approved evidence policy, and do not regenerate automatically. Any replacement generation is a distinct explicitly approved spend, never described as free retry. Exactly-once external charging is not claimed.

### C. Atomic budget and audit

Represent money in integer micro-USD with immutable price-table version, period, authorization ID and per-job/per-attempt limits. Require all three current safeguards and a separately recorded owner authorization before a paid dispatch. Transaction invariant: settled spend + all open reservations + proposed reservation ≤ authorized cap. Reserve the verified worst-case bound for each bounded chunk (input and maximum output), rounded upward; if provider output/cost cannot be bounded, paid activation is blocked. A minutes estimate is never a safe reservation bound.

Use unique attempt/request keys and normalized jobs, attempts, reservations, budget periods, approvals, assets, audit_events and outbox tables. D1 async atomic batches must implement SQL-level guards, not an optimistic JavaScript read followed by unrelated writes. For example, a conditional mutation inserts an operation token only when all predicates hold; subsequent reservation, state, audit and outbox inserts are conditioned on that token in the same batch. Constraint/trigger errors must roll the batch back; zero-match is explicitly detected without partial side effects. Prove this in the target runtime before choosing it permanently. No caller-controlled SQL and no synchronous BEGIN IMMEDIATE port. If the API cannot implement the invariant, stop and return to the owner with PostgreSQL or a separately approved coordinator alternative.

Settle each attempt once using a unique settlement key, release only its proven unused reservation and append audit atomically. Missing usage is not zero usage. Actual charge above reservation freezes dispatch, records the financial incident and requires owner reconciliation; never hide debt to preserve a nominal cap. Monthly rollover preserves outstanding reservations and cannot erase liabilities. Provider dashboards may offer soft alerts rather than a hard cap; verify behavior and retain application enforcement.

### D. Authoritative Git outside transactions

A read-only GitHub source synchronizer resolves main to an exact commit, reads only approved canonical published MDX paths at that commit, applies the existing versioned extractor, and validates visibility, locale and hashes. Do not trust caller snapshots or duplicate canonical content. Worker runtime uses fixed-origin HTTPS GitHub APIs, not shell/git subprocesses. Cache approved extraction evidence and commit/path/blob IDs as derived records.

Use a durable per-article source generation and a short verification attestation. Resolve authoritative main outside D1 writes on submit, review and publish; atomically compare observed source generation/hash/parser/voice policy and job version on commit. Source-change webhook with verified signature plus scheduled main polling marks dependent work STALE and increments publication generation. Network errors fail closed for new approvals/publications.

GitHub and D1 cannot share a transaction: a check followed by commit has a cross-system race. Publication must remain inaccessible until a second post-commit authoritative check succeeds; delivery must validate source authority before serving (conditional GitHub check per request initially, no stale-on-error). A main change between that check and streamed bytes remains an irreducible boundary; never claim instantaneous invalidation across providers. Owner must accept the measured withdrawal/source-detection SLA or require a later coordinated content-release design. No workflow change to serialize editorial main merges is authorized here.

### E. Cloudflare persistence adapters

Extract asynchronous interfaces for identity, source authority, transactional command execution, private objects, provider and audit export; keep pure schemas/state policy and existing F-01–F-04 regression obligations. Use Web Crypto and fetch; do not bundle node:sqlite, filesystem permissions or child_process as a durability strategy. Replace the mutable aggregate with migrations and indexed rows. Pin runtime compatibility date and validate target API limits, memory, chunk sizes, streaming, codec metadata and bounded output. Heavy transcoding is outside this proposal; if required, return for runtime approval rather than introducing containers silently.

No migration of mock approvals into production authority. Preserve historical audit bytes; new production records carry policy/schema versions and environment IDs. Stage with synthetic fixtures and local emulators first. Tests must prove CAS, batch rollback, snapshot consistency and duplicate delivery in the actual selected platform before paid tests.

### F. Identity and role separation

Recommend Access as gateway with OIDC MFA, plus application sessions keyed by immutable (issuer, subject), live role directory, revocation generation and bounded session lifetime. Access admission alone grants no Generator/Reviewer/Publisher role. Verify JWT server-side using trusted issuer keys with bounded rotation cache, audience, times and supported algorithms; deny forged headers, service tokens presented as humans, unknown keys and revoked subjects. Direct Workers endpoints require the same authentication or are disabled; gateway bypass is tested.

Worker service identities can claim/generate/store candidates, never review or publish. Propose reviewer ≠ submitter and reviewer ≠ executing human identity; Publisher may be that reviewer for a small operation only through a distinct authenticated act. Administrator may manage access but cannot manufacture listening approvals. Paul must approve this stronger separation policy and identify a second reviewer; sole-owner operation blocks self-reviewed production release. Break-glass may halt/revoke, never bypass approval. Record verified actors on denials; invalid identities remain unverified with bounded reasons and no JWTs.

### G. Human review

Separate protected administration UI, not public-site identity enrollment. Reviewer listens to complete exact Chinese or English audio through authenticated streaming; UI shows canonical source, locale, immutable version, voice/model and synthetic disclosure. Explicit human attestation includes completeness, Scripture/pronunciation/theological fidelity and device evidence. Review binds every ADR-0032 hash plus parser/model revisions and session. No checkbox, automated transcript or successful codec check substitutes for listening. Rejection reason codes are bounded; free text requires separate privacy policy and must not enter generic logs. Require origin/CSRF defense, short sessions and current roles again when committing approval and publication.

### H. Private audio delivery

Keep both candidates and approved objects private, content-addressed and write-once; reject conflicting bytes at an existing key. Browser never receives R2 credentials or listing. Review service authenticates every range request and returns private/no-store responses with correct media headers; no bearer tokens in URL/logs. Avoid presigned URLs for immediate revocation requirements because issued URLs remain usable until expiry.

Later authorized public listening uses a dedicated Worker gateway mapping canonical ID/locale/version to an active publication record. Public R2 URLs stay disabled. Promotion verifies object/audio/source hashes, codec/duration, approval, role and generation; D1 commits intent + outbox, then immutable object copy/verification, then conditional active mapping. No cross-resource atomicity claim: incomplete objects remain inaccessible. Publication flag remains disabled through implementation until final activation approval.

### I. Withdrawal and CDN

Commit revocation/tombstone and increment publication generation first, then enqueue cache purge and object-retention tasks atomically with audit. Gateway checks active mapping on every request with primary-authoritative consistency, fail closed on D1/source errors. Initial delivery bypasses shared CDN caching and sets no-store; this removes cache purge from the authorization critical path. Range requests repeat checks; an already downloaded or in-flight response cannot be recalled.

If CDN caching is proposed later, cache only immutable bytes behind the Worker authorization check, key by asset + publication generation, use bounded TTL, explicit purge URLs/tags and verified purge completion. Never let a cache hit bypass revocation. Do not mount a static public object link. Agree withdrawal SLA before activation and test stale links, service failure, concurrent publish/revoke, range playback and old Pages deployments.

### J. Independent audit retention

D1 mutation and local append-only audit/outbox commit together. Ordered event IDs, previous hash and policy/environment version support gap detection. A separate collector reads contiguous committed events, creates signed batch checkpoints and verifies receipt into a separately administered retention-locked store; generator/Publisher have no delete, retention-change or signing rights. An independently held checkpoint detects whole-database rewrites; hash chains alone do not.

Recommend hourly export and daily independently verified checkpoint; block paid dispatch/publication when export lag exceeds one hour or a gap/tamper alert exists. Initial publication requires an independent receipt for its approval and publication intent. Still acknowledge an export vulnerability window: if zero-loss independent audit is required, choose a synchronous external receipt protocol in a further reviewed design. Propose 12-month audit retention pending owner privacy approval. Storage-lock administrative bypass/deletion powers must be documented and tested; a locked same-account bucket is not assumed independent.

### K. Restore and incidents

Propose RPO ≤ 1 hour, RTO ≤ 4 hours, with owner approval of staffing/cost. D1 Time Travel supplements daily encrypted exports and hourly retained audit; keep object inventory/checksums and immutable media backup under separate restore permissions. Configure queue DLQ and a durable sweeper so queue expiry cannot lose job authority.

Restore into an isolated environment with all production flags off, execution paused and no public promotion. Allocate a new environment epoch and fence all restored leases; restored DISPATCHING/UNKNOWN attempts retain liabilities and require provider reconciliation. Cross-check audit checkpoints, settlements and media inventory before restoring roles or opening delivery. Never replay old outbox sends or provider calls automatically. Practice lost worker, DB outage, audit outage, stolen key, corrupt object, bad migration and vendor outage drills. Incident owner Paul plus designated operator; rotate/revoke credentials only through separately authorized operations. Pages rollback is independent; backend rollback cannot roll back billed work or an incompatible schema. Use additive migrations and explicit compatibility checks.

### L. Bilingual versions

Use canonical ID + locale + source hash + parser version + voice-config hash + model revision + explicit narration version as immutable generation identity. Allocate positive versions atomically with a uniqueness constraint; retrying transport preserves the same attempt, regeneration creates a new version. Chunk index/text hash and assembly manifest preserve exact paragraph order with no silent translation or omission. Retain per-locale approvals; never transfer Chinese approval to English. Proposed default: activate each locale independently only after its full review, showing no fabricated fallback for the other; Paul may instead require paired bilingual release. Changed source or voice invalidates dependent approvals; unrelated Git commits do not change immutable provenance. Include accurate Chinese/English synthetic disclosure and no representation as Paul's recorded voice.

## Owner decision matrix

Recommendations are not approvals. Approving architecture, merging this documentation, provisioning resources, spending and public activation are separate decisions.

| Decision | Authorization category | Recommended decision / checkpoint |
|---|---|---|
| Preserve canonical MDX, existing locales/static export/main-only Pages deployment | Already authorized: Accepted ADRs 0009/0011/0015/0021 | Retain without amendment |
| State machine, source/asset-bound approvals, RBAC, private candidates, default zero spend | Already authorized: ADR-0032, completed Phase 6D | Preserve F-01–F-04 invariants |
| Workers/D1/Queues/R2 integration, async persistence, admin/delivery boundary | New ADR and owner approval | Accept ADR-0033 only after reviewing transaction/runtime proof obligations |
| Access + selected OIDC issuer/MFA/live directory; stronger separation | New ADR and owner approval | Choose issuer, operators and second reviewer; no anonymous/public enrollment |
| Independent audit account/custodian, region, 12-month retention and recovery objectives | Owner approval under new ADR | Confirm retention/deletion policy, RPO/RTO, independent credentials and administrator powers |
| OpenAI provider, model revision, per-locale voices, vendor processing | Owner approval before provider credentials / paid tests | Confirm availability/quality, retention/residency and billing evidence; no custom voice cloning |
| Resource IDs, regions, service roles, deployment/DNS permissions and secrets | Separate provisioning authorization | Approve exact resource and least-privilege permission inventory; do not reuse Pages broad token |
| TTS monthly/per-job cap, worst-case bounds and uncertain-charge policy | Separate spending authorization | Choose numeric caps and bounded paid canary; current cap stays zero |
| Public gateway and per-locale release; source race and withdrawal SLA | New ADR plus owner approval | Accept residual cross-provider race and no-store delivery; CDN optimizations deferred |
| Implementation scope and merges | Separate owner instruction after ADR acceptance | Approved contracts/paths per phase, independent review before merges |
| Final live narration / publication | Explicit final activation approval | Only after Phase 6E.5 and bilingual listening/device evidence |
| CDN byte cache, subtitles/video, voice cloning, multi-provider failover, China infrastructure | Deferred; new decision if pursued | Excluded from initial integration |

## Transparent cost model

USD/month, planning only; no spending authorization. Official Cloudflare prices retrieved 2026-10-12. Confirm account plan, aggregate allowance consumption, rounding, taxes and changed prices before authorizing. TTS rate below is an **unverified planning assumption**, not a quote or reservation ceiling: official model/pricing pages were reachable but the retrieved content did not expose a usable speech price. Reverify selected model before approval.

Assumptions (unverified workload, deliberately explicit): A articles/month; 2 languages; 10 finished minutes each; 20% extra synthesis for revisions; 128 kbps MP3; retain 12 months and budget two stored copies/versions. Thus finished minutes=20A; synthesized minutes=24A; new finished bytes=0.0192A GB/month; steady media inventory=0.4608A GB. Each localized article plays fully 100 times/month, giving 2,000A delivered minutes and 1.92A GB/month. Viewer range requests may multiply request counts. Human listening minimum=20A/60 hours before revisions.

Budget estimates assume 50 operational Worker invocations per localized article plus four per playback, 20 ms CPU each; ≤100,000 D1 reads and 1,000 writes per localized article; ≤50 queue messages per localized article at three operations each, <64 KB; ≤100 R2 Class A writes per localized article and four reads per playback. Audit estimate: 100 events × 1 KB per localized article, retained 12 months (0.0024A GB), plus snapshots not included. Actual measurements replace these assumptions.

| Monthly category | Small: 10 articles | Medium: 50 articles | Large: 200 articles |
|---|---:|---:|---:|
| Finished / synthesized minutes | 200 / 240 | 1,000 / 1,200 | 4,000 / 4,800 |
| TTS at unverified $0.015 / synthesized minute | $3.60 | $18.00 | $72.00 |
| Compute: Workers Paid base, assumed below included use | $5.00 | $5.00 | $5.00 |
| D1 incremental usage, assumed < included rows and 5 GB | $0 | $0 | $0 |
| Queues incremental usage (3,000 / 15,000 / 60,000 ops) | $0 | $0 | $0 |
| Media inventory GB (two copies, 12 months) | 4.608 | 23.04 | 92.16 |
| R2 media storage after 10 GB allowance, rounded whole GB | $0 | $0.21 | $1.245 |
| R2 media Class A/B operations, below allowances | $0 | $0 | $0 |
| Delivery: 19.2 / 96 / 384 GB R2 egress | $0 | $0 | $0 |
| Independent audit retention + signing + backup (unverified allowance) | $5–15 | $5–15 | $5–15 |
| Monitoring/alert delivery (unverified allowance) | $0–10 | $0–10 | $0–10 |
| Illustrative subtotal, rounded | $13.60–33.60 | $28.21–48.21 | $83.25–103.25 |
| Human listening hours, excluded from dollar subtotal | ≥3.33 | ≥16.67 | ≥66.67 |

Storage uses ceil(max(0, inventory GB − 10)) × $0.015; separate-account backups may have a separate allowance or extra costs. Do not double-count allowances across shared workloads. Subtotals exclude paid identity, support/SLA upgrades, engineering/operator labor, taxes, additional retention, legacy article backfill and CDN optional services. Access may fit its free ≤50-seat tier, but IdP/MFA/support eligibility and paid seat terms require confirmation; these costs are **not assumed zero** in a final budget. No live vendor account or resource inventory was queried.

Beyond included usage: Workers requests $0.30/million beyond 10 million and CPU $0.02/million ms beyond 30 million; D1 reads $0.001/million beyond 25 billion, writes $1/million beyond 50 million and storage $0.75/GB-month beyond 5 GB; Queues $0.40/million beyond 1 million operations. R2 Standard is $0.015/GB-month, Class A $4.50/million and Class B $0.36/million beyond allowances; apply billing-unit rounding. Delivery gateway compute is included in the modeled Worker use, not free merely because R2 egress is free. Unknown charge retries, traffic attacks and long-term versions can dominate article-count estimates.

Official sources: [Workers and current logs pricing](https://developers.cloudflare.com/workers/platform/pricing/), [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/), [Queues pricing](https://developers.cloudflare.com/queues/platform/pricing/), [R2 pricing and rounding](https://developers.cloudflare.com/r2/pricing/), [Access plans](https://www.cloudflare.com/plans/zero-trust-services/), [OpenAI model](https://developers.openai.com/api/docs/models/gpt-4o-mini-tts), [OpenAI pricing to reverify](https://developers.openai.com/api/docs/pricing). Workers Logs pricing is documented to change December 1, 2026: refresh monitoring estimates before that date. Audit retention is not generic Workers Logs retention.

## Accelerated plan after architecture acceptance

Common gate: accepted ADR, approved version/scope/allowed paths, interface schema and owner decisions; no implicit infrastructure or paid authorization. Preserve independent security review of actual commits, not implementation reports.

| Phase / owner | Dependencies | Work and parallelism | Acceptance / human checkpoint |
|---|---|---|---|
| 6E.2 Real TTS Adapter / implementation owner assigned by Paul | Approved provider contract and price/billing rules | Implement disabled async adapter, model/voice allowlist, bounded chunks, codecs, timeout/unknown ledger contract; fixture tests. May parallelize with 6E.3 persistence and 6E.4 object adapter using frozen interfaces | No network spend in default CI; independently test known/unknown responses, exact source assembly and usage bounds. Paid canary requires separate permission |
| 6E.3 Production Runtime and Jobs / assigned implementer + operator | Approved identity/runtime/DB/queue, 6E.2 attempt contract | D1 migrations/atomic commands, directory and sessions, renewable leases, fences, reservations, outbox, sweeper/DLQ and protected admin. Identity and persistence can proceed in parallel | CAS/rollback and target-runtime failure proof before integration; resource provisioning/deployment separate. No service has Reviewer/Publisher rights |
| 6E.4 Private Storage and Publication / assigned implementer + human reviewer | Approved storage/delivery/retention; asset contracts; identity and source authority needed for integration | Private R2 adapter, media validation, review UI, promotion saga, source invalidation, authenticated ranges, gateway revocation. Object/media/UI fixtures can run parallel with 6E.2/3 | Private leakage and publish/revoke races fail closed; bilingual human attestation; publication switch still off |
| 6E.5 End-to-End Security Validation / independent reviewer, Paul final approver | Integrated 6E.2–4, audit collector, measured runtime and recovery evidence | Separate reviewer exercises forged/revoked identity, billing ambiguity, worker interruption, concurrent settlement/recovery, source races, missing receipts, restore and withdrawal | Actual selected-stack tests; all baseline 211 tests plus meaningful new cases, required CI/default production build/static export preserving existing 324 routes. iPhone and separate zh/en full listening. Independent approval and final activation decision |

Do not run paid adapters in PR CI or modify existing Pages automatic deployment to deploy a backend. Proposed backend releases use a separately approved protected workflow/environment with least-privilege credentials and manual promotion after security review; designing this boundary is not permission to create it. Owner must assign operational and implementation owners before each phase is READY.

## Acceptance criteria and remaining blockers

The proposal is ready for owner architecture review when components, cost assumptions, atomicity obligations, failure states, approval categories, scope and residual risks are explicit; this document meets that design-preparation gate. It is not production-ready evidence.

Before implementation: Paul accepts ADR-0033 and explicitly chooses identity issuer/operators/role separation, infrastructure/regions, vendor/model/voices, independent audit custodian/retention, source/withdrawal SLA, bilingual release policy, recovery targets and phase scope. Before resources or secrets: exact provisioning/permission inventory authorized. Before any spend: verified prices, output bounds, billing-reconciliation capability and numeric caps authorized. Before activation: independent selected-platform security review, retained audit evidence, restored-state drills, no bypass/duplicate dispatch/budget leak, source-bound publication, real bilingual listening and iPhone playback, and explicit Paul activation approval.

Unresolved risks: D1 conditional transaction semantics must be proved; provider accepted-but-unknown requests may remain unattributable; source freshness crosses two systems; independent audit has bounded export lag; administrative retention bypass must be audited; vendor processing/region and China reach remain undecided; small-team reviewer capacity may block release. If these cannot satisfy the approved gates, return to architecture review instead of relaxing security.

Safety verified in baseline code: `productionTtsEnabled=false`, `costAuthorized=false`, `maxSpendUsd=0`. This PR changes documentation only. No paid call, infrastructure provisioning, secret creation, deployment, public narration, application implementation or merge. Public analytics/event registries and canonical article bytes remain unchanged; future private operation telemetry must exclude source prose and sensitive ministry submissions.

Supporting technical references: [D1 batch API](https://developers.cloudflare.com/d1/worker-api/d1-database/#batch), [Queue delivery guarantees](https://developers.cloudflare.com/queues/reference/delivery-guarantees/), [D1 recovery](https://developers.cloudflare.com/d1/reference/time-travel/), [R2 retention locks](https://developers.cloudflare.com/r2/buckets/bucket-locks/), [Access JWT validation](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/). Platform behavior must be tested, not inferred from SQLite or local fixtures.
