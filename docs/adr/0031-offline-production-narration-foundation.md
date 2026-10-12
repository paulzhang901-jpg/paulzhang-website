# ADR-0031 — Offline Production Narration Foundation (Phase 6C.2)

Status: Proposed — requires Paul review before merge
Date: 2026-10-11

## Scope and decision

Extend ADR-0030 without changing published MDX, routes, player mounting, Cloudflare configuration or paid provider behavior. The new foundation is **offline, disabled by default, trusted-local only**. A canonical published MDX file is the sole authority. A deterministic narration snapshot retains paragraphs, Scripture quotations, proper names, punctuation and locale, with SHA-256 of the exact extracted text. An independent hash identifies the voice configuration. The cache identity includes canonical ID, locale, source hash and voice configuration hash. Each regeneration requires a distinct positive version number and asset ID.

## Human review and publication boundary

State transitions are DRAFT → GENERATED → PENDING_REVIEW → APPROVED → PUBLISHED, with rejection and staleness paths. Phase 6C.2 supports mock generation and review metadata only; **PUBLISHED is categorically blocked for mock media**. An approval references the exact source SHA-256, audio SHA-256, reviewer identity and approval timestamp. Caller-supplied `authorizedReviewers` is only a local testing policy, **not authenticated identity**. Hash consistency is not independent source authenticity, and a local manifest does not constitute a real human signature. No production media can be approved for publication until a later phase implements trusted operator authentication, independently protected audit records, production media provenance and publication authorization.

## Cost and storage boundary

`productionTtsEnabled=false`, `costAuthorized=false`, `maxSpendUsd=0`. All non-mock providers, production TTS and production object storage are unimplemented or throw. No OpenAI API key, Cloudflare R2 resource, upload or network call is required. Mock WAV files use unpredictable, OS-user-owned `0700` temp directories and exclusive `0600` file creation. This is **not** a durable cache: cache keys are stable, but files are transient and duplicate generation prevention is only process-local. No cross-process locks, distributed budget reservations or external storage protection are claimed.

## Remaining production requirements

Before any paid generation or production publication: separate approval of an ADR, secure service-side credential storage, authenticated reviewer identities, tamper-evident audit storage, per-article spend reservation and retry accounting, cross-process deduplication, durable content-hash-based cache, verified audio provenance, R2 object key/permissions and atomic publication, automatic STALE invalidation on article edits, real iPhone audio playback verification, and independent human review of Chinese/English pronunciation and completeness. Existing browser speech synthesis remains untouched. Future catechetical course narration may reuse the same foundation only with separate content identity and human review policy.

## Phase 6C.3A security boundary clarification

All serialized manifests are **untrusted metadata**. The `authorization_trust` field is fixed to `SIMULATED_UNVERIFIED`. An `APPROVED` state represents **only local simulated review**, never independently verified human authorization. `assertVerifiedNarrationApproval()` always rejects. Neither matching hashes nor structurally valid audit history prove reviewer identity, approval authenticity, or a protected audit trail. A fully fabricated but internally consistent sequence may pass structural validation and must **never** establish production authorization.

History validation now checks required event fields, the complete legal transition chain from DRAFT through GENERATED, actor consistency, chronological ordering, content/asset hashes, duplicate or missing steps, final-state agreement and approval bindings. This is structural validation only, **not cryptographic authentication**. Caller-provided reviewer allowlists remain simulation inputs, not an identity service.

Generation validates the caller-provided snapshot structure, canonical ID syntax, locale, exact text and SHA-256 before invoking the mock provider. Existing approved MDX extraction rules remain unchanged. Future production approval and publication must independently revalidate the latest authoritative article content. The voice configuration remains restricted to the deterministic offline mock configuration and hash.

The built-in MockToneProvider is the default. Injected providers require an explicit `trustedLocalTestProvider:true` opt-in and are permitted **only in trusted local tests**. This flag is not a sandbox: arbitrary injected JavaScript can perform side effects including network calls. Never accept injected providers from untrusted inputs. No production provider exists.

Local temporary file protections remain in place. Cross-process concurrency, hostile same-user processes, filesystem TOCTOU, durable cache, and production identity/authenticity remain unresolved **production-readiness blockers**. Production TTS, storage and publication remain disabled.
