# Paul Zhang Publishing Studio — local checkpoint

ADR-0044 implementation; V1 Chinese finalized Markdown articles only. No public website route, new service or paid dependency.

## Resume / start

From this repository run `tools/publishing-studio/start.command` (or `pnpm run studio` with Node available). Open the private loopback link printed in Terminal. Default private data is the existing sibling `Publishing Studio Local Data` folder; `STUDIO_DATA` overrides it. Existing upload bytes and append-only job events remain in place. Do not delete this folder to recover a job.

Upload UTF-8 `.md` (at most 1 MiB), resolve required metadata, validate and review exact body/destination. A separate explicit publication action authorizes only that version. Upload/frontmatter do not authorize publication. The existing local acceptance upload says **不可发布**, and remains unapproved.

## GitHub authorization — owner action required

Click **GitHub 安全授权** in the existing Studio, or open `tools/publishing-studio/configure-github.command`. Both launch the same native macOS hidden-input window. No Terminal commands or web Token field are required. Token values go only into the macOS Keychain item for this repository, never a local plaintext file or browser persistence. The setup verifies read-only GitHub endpoints before saving; failure or cancellation does not publish or save a credential. Existing credentials are not overwritten.

Use a short-lived fine-grained token scoped only to `paulzhang901-jpg/paulzhang-website`: Contents/PR read-write; Actions/Checks/Commit statuses read-only. No Administration or Workflows write, no protection changes. Never paste a token into chat.

Worker and Git push share the Keychain credential through private process memory. Codex receives neither the Token nor the Git push authorization environment. Read-only success does not prove write/merge permission. No PR or publication is part of authorization testing.

If macOS asks for Keychain access, verify the helper belongs to this Studio before allowing this application. Do not disable Gatekeeper, remove quarantine broadly or bypass an OS warning. If a warning prevents opening, retain the exact warning for diagnosis; the Studio button is the normal entry point.

## Execution and recovery

Each approved job uses a dedicated website worktree and one scoped article PR. Required checks and independent review remain binding. CI/review/deployment waits are observed periodically; failure, missing credential or exceptional conflict requires explicit recovery. Resume re-observes existing PR/deployment state; it never duplicates a PR intentionally or replays a merge blindly.

The worker calls the same locked Next build CLI directly with Node, avoiding the local package-manager shim's Turbopack port issue. No build flags, application routes or deployment workflow are changed. All other existing gates are reused.

Production deployment remains exclusively the existing validated main Actions job. No feature-branch deploy. The workflow commit, public route/canonical/body and exact source bytes must verify before archive. Archive is additive in the existing `08 Writing/Articles` on a dedicated vault branch; vault main merge remains owner-controlled. Body conflict or archive failure preserves `WEBSITE PUBLISHED / OBSIDIAN ARCHIVE INCOMPLETE`.

## Evidence and remaining live acceptance

- Preserved original dirty Luke publication checkout; isolated Studio branch starts at GitHub main `3021c70b4bfdea95f12ffedabc897fd415430a4`.
- Existing full repository test suite passed previously; content validation passed (94 items, 104 existing warnings), architecture passed, direct Node/Next production build passed, static export passed 444/444 routes with no broken internal links.
- Real browser upload/preview and real disk byte/hash preservation passed. Real authenticated Codex probe passed, including from the browser. Temporary Git vault archive test passed with unchanged original main and exact-body/idempotency/conflict checks.
- Latest targeted credential/HTTP/permission-stop tests and lint/typecheck are recorded in CHECKPOINT.md. Unaffected suites were not repeated.
- Native Keychain authorization succeeded on 2026-11-01; read-only GitHub repository/PR/Actions endpoints verified. No article PR, protected merge, production deployment or actual personal-vault write has occurred. No publication success is claimed.
- PR #112 completed real protected merge, matching main deployment, live canonical/body verification and exact-body dedicated Vault branch archival on 2026-11-01. Vault main integration remains explicitly owner-controlled. The original forbidden local fixture was never published. See CHECKPOINT.md for immutable commits and run IDs.

Private diagnostics: each job's `worker-private.log` and executor directory. Browser shows redacted stage/waiting evidence. Preserve logs on failure and inspect the exact failing step before using Resume.
