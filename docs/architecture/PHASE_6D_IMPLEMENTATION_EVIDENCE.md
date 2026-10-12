# Phase 6D governance implementation evidence

Classification: ARCHITECTURE-COMPLIANT IMPLEMENTATION under Accepted ADR-0032.
Owner: Paul Zhang. Goal: independently governed synthetic narration, without activation.
Scope: future media infrastructure, outside the V1 static reading experience.
Allowed paths: isolated server library, governance tests, package scripts, this report.
Base: 4c0caaaab918e4faddd5fdf3e78081ea0e32b752.

## Implemented boundaries

- 6D.2: strict TypeScript/Zod source, voice, asset, job, approval, ledger and audit schemas; canonical serialization, hashes, legal transitions and typed errors. Canonical content remains Git MDX; no content duplication or route changes.
- 6D.3: a framework-neutral protected administration entry, fixed-key RS256 JWT verification, issuer/audience/time validation, authoritative session revocation and server-side role lookup on every act. Token roles and caller-supplied reviewer fields do not grant authority. A verifier-local WeakSet prevents fabricated identity objects. Review requires a different subject from the creator, an explicit listening act and exact immutable asset binding. This conservative separation is implemented for isolated review; its activation policy still needs owner confirmation under ADR-0032.
- 6D.4: durable SQLite state and a versioned schema, BEGIN IMMEDIATE write serialization across processes, idempotent source/config/version identity, persisted replay protection, leases/fences, three-attempt retry limit, failure recovery, integer micro-dollar reserve/settle accounting, transaction rollback and denial audits. Generation accepts only mock jobs at zero spend; no paid provider adapter exists. SQLite requires a separate Node 24+ administration runtime and owner-only filesystem, not the static Next.js runtime. SQLite is a local durable reference implementation, not a selected cloud vendor.
- 6D.5: owner-only content-addressed private files, exclusive writes, integrity validation, no public URLs, protected reviewer reads, source/voice revalidation at review and publication, automatic STALE invalidation on governed mutations that detect drift, explicit invalidation, approval revocation, and a fail-closed publication gate. Production promotion deliberately throws; neither mock approval nor any service action can publish.

`GitPublishedSource` fetches authoritative main before every reconciliation, validates the configured repository identity and canonical path mapping, and reuses Phase 6C's fail-closed published MDX extractor. Failures propagate; no cached offline source is silently accepted. Provider selection and key/session/role directory wiring are server-side integration boundaries. Tests use locally signed isolated JWTs and isolated source/voice authorities; they do not claim a live identity-provider deployment.

## Acceptance evidence

`test:narration-governance` is included in `pnpm test`. Regression cases cover authenticated workflow, unauthorized reviewer/publisher/read, forged identities and JWTs, revoked sessions, creator separation, listening requirement, strict admin input, replay, duplicate jobs, competing processes using the actual service, expiry/fencing, failure/retry limits, budget overrun, rollback, source/voice drift, revocation, object corruption, append-only audit triggers and audit truncation. Existing Phase 6C code remains unchanged.

Audit events contain IDs, hashes, actor subjects, decisions, policy, timestamps and transitions; no source text, tokens or sensitive counseling content. The SQLite audit table forbids UPDATE/DELETE and is compared against operational history. Hash chains detect corruption and truncation relative to this table. An administrator able to replace the whole database can rewrite both: this is not a cryptographic authenticity claim. Independently retained, protected audit exports and retention/access policies remain activation prerequisites.

## Operational limits and remaining activation decisions

No production credentials, paid calls, Cloudflare resources, public narration, deployment, player mounting, or automatic merge. All required flags remain `productionTtsEnabled=false`, `costAuthorized=false`, `maxSpendUsd=0`.

Before production integration: select identity/admin/database/storage providers, configure revocation and least-privilege roles, approve retention/vendor/privacy policies, independent security review, protected audit export retention, provider-side spending controls, crash reconciliation for real paid attempts, an authorized atomic publication/storage promotion adapter, automatic source-update scheduling, withdrawal/rollback from actual public storage, and real iPhone plus independent bilingual listening. None is inferred from passing isolated tests. Private immutable files written before a rolled-back database transaction can remain unreferenced; they are never publicly served and require retention/reconciliation policy before activation. The local filesystem assumes a trusted service OS identity; it is not protection against a hostile process with that identity.

No existing website analytics, canonical content, localization, public routes, hosting or Phase 6C safeguards changed. ADR-0030/0031 remain intact; Accepted ADR-0032 and the user's implementation authorization govern this new isolated plane. This PR requests implementation review only, never production readiness or activation.

## Executed validation and delivery gate — Phase 6D.6A

Supported Node v24.19.0 and repository-pinned pnpm 11.19.0. No dependency, application, build configuration or security-check changes were needed for recovery.

| Check | Feature | Unchanged base |
|---|---|---|
| TypeScript | PASS (`pnpm typecheck` and build's TypeScript stage) | PASS (same pinned compiler and build stage) |
| ESLint | PASS (`pnpm lint`) | Existing baseline checks retained |
| Tests | PASS (`pnpm test`, including all 10 governance scenarios and competing service processes) | Existing baseline `pnpm test` previously passed |
| Architecture | PASS (`pnpm validate:architecture`; architecture tests also pass) | Unchanged architecture |
| Content | PASS (`pnpm validate:content`, 77 items; 81 existing optional metadata/translation warnings) | No source content changed |
| Production build | PASS (`pnpm build --webpack`) | PASS (equivalent pinned Next.js `build --webpack` in detached base worktree) |
| Static export | PASS (`pnpm validate:static-export`) | PASS (same repository validator) |
| Public routes | PASS, same 320 HTML files as base; validator checks 324/324 production routes | Matching inventory |

The initial failure had two reproducible execution-environment restrictions: local TCP bind returned EPERM, and asynchronous child-process captured stdout was empty even for a trivial Node/echo probe. Approved execution permission restored both basic probes and Next.js's TypeScript subprocess output. Turbopack's nested worker still could not bind, so validation used Next.js's supported `--webpack` option on both base and feature. The production configuration remains unchanged: static export, TypeScript enabled, no ignored build errors. Baseline Turbopack in the temporary worktree also rejects its shared node_modules symlink outside the worktree root; Webpack avoids that separate temporary-worktree limitation. Successful feature tests and build/export are independent regression evidence, not an inference from main's previous failure.

Export validation reports no broken internal links or runtime image-optimizer URLs, valid canonical/hreflang and sitemap/robots, and a passing public/private boundary. Both Chinese and English routes remain intact. Build outputs stay outside the commit. The default local Turbopack restriction remains an environment limitation; repository CI and production build commands are unchanged.

Final readiness: READY FOR PAUL REVIEW of the isolated implementation foundation. Commit and PR creation are authorized after these successful gates. This is not production readiness, merge approval or activation authorization. Live vendor selection, identity integration, protected audit retention and the other activation prerequisites above remain outstanding.
