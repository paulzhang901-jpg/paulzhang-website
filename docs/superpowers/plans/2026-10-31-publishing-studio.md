# Publishing Studio Implementation Plan

**Goal:** Local Chinese Markdown upload, exact preview and approved publication through existing GitHub/main pipeline, followed by existing vault archival.
**Owner:** Paul Zhang. **Classification:** ARCHITECTURE-COMPLIANT IMPLEMENTATION. **Boundary:** V1 local operations only.
**Spec:** docs/adr/0044-local-publishing-studio.md (Accepted).
**Allowed Paths:** tools/publishing-studio/**, tests/publishing-studio/**, package.json, this operational plan.
**Stack:** Node HTTP, existing tsx/gray-matter/content validators; fixed Codex CLI; Git and GitHub REST.
**Privacy/Analytics:** Private external job storage, no public telemetry, no upload execution; only approved publication content goes to GitHub.
**ADR impact:** None. No public routes or schema changes.

## Tasks
- [ ] Test then implement durable exclusive upload storage, fatal UTF-8, bounds, safe paths and byte/hash preservation.
- [ ] Test then implement existing schema/taxonomy/MDX validation, metadata resolution and exact-version approval.
- [ ] Test then implement loopback single-origin UI/API, owner bootstrap session, CSRF and escaped preview.
- [ ] Implement fixed read-only Codex metadata preflight, authenticated execution probe, private diagnostics and explicit failure.
- [ ] Implement serialized protected PR/main deployment observer and resumable evidence. Never simulate a stage.
- [ ] Assess existing archive tools; implement article archive adapter with collision/body checks, dedicated vault branch, no vault merge.
- [ ] Run actual disk and HTTP integration tests, existing gates, review diff, document startup and remaining live acceptance.

## Review focus
Untrusted frontmatter/code, request origin/session, symlink/path collision, stale approvals and restarts, falsely inferred deployment/archive success.

## Acceptance
Unit/integration on real temporary files; real authenticated Codex probe separately. Public E2E requires exact owner-approved article; no deployment authorized by implementation request.

## Ledger
Original dirty Luke checkout preserved; independent local repository synced from GitHub main 3021c70. Existing archive_sermon.py handles sermon-specific structures, not article archive records; Phase 1 adapter limited to existing 08 Writing/Articles conventions. No sermon support in this phase.

## Incremental continuation (2026-10-31)
Preserved all existing work. GitHub credentials remain an explicit owner action; no repeated live authentication attempts. Added secure local hidden-input setup, private-token-file validation, read-only readiness UI, process-only Git push authentication sharing the API token, and a pre-Codex permission stop. Direct Node invocation of existing locked Next build reuses the previous successful build method. Targeted credential, GitHub-gate, HTTP and permission-stop tests passed; lint and typecheck passed. No production action or personal-vault write.
