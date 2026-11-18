# Publishing Studio checkpoint — 2026-10-31

Repository: current `paulzhang-website` under the Digital Ministry workspace.
Branch: `codex/publishing-studio-mvp`, based on `origin/main` 3021c70.
All implementation files are preserved locally; not committed/merged/deployed.
Original Luke checkout is untouched.

## Completed evidence retained
- Full repository tests: `/private/tmp/paul-studio-repo-tests.log` (exit 0).
- Content validation: `/private/tmp/paul-studio-content.log` (94 items; 104 pre-existing warnings).
- Direct locked Next build: `/private/tmp/paul-studio-direct-build.log` (exit 0). Earlier package-manager wrapper runs failed on Turbopack port binding; direct Node build succeeded. Worker now uses this same CLI directly.
- Static export: actual validator passed 444/444 production routes, zero broken internal links.
- Actual Codex authenticated execution succeeded, including browser probe. Evidence under sibling `Publishing Studio Local Data/connection-probe`; no need to repeat.
- Existing local browser acceptance job `409eaf35-68a1-4ec2-8069-5ad871bd3659` is Validated and **not authorized for publication**. Its body explicitly says 不可发布. Do not publish it.
- Real temporary-vault archive test passed; actual personal vault has not been written.

## Latest continuation / affected checks
- Secure credential file read + Git process-only auth config: 2/2 passed.
- GitHub failed CI / pending review / mismatched deployment tests: 3/3 passed.
- Real HTTP upload and GitHub readiness session/CSRF tests: 2/2 passed.
- Worker credential stop before Codex/Git changes, persistent waiting after restart: 1/1 passed.
- Typecheck and lint: exit 0. `git diff --check`: exit 0.
- Unaffected content/archive/full-site suites were not rerun.

## Concrete blocker
No usable local GitHub API credential. Prior read-only attempt reported credentials unavailable. Do not repeatedly retry authentication. Connected GitHub plugin auth cannot be exported into the local worker.

Owner next action: create a short-lived fine-grained token scoped only to this repository (Contents/PR read-write; Actions/Checks/Commit statuses read-only), then run `tools/publishing-studio/configure-github.command` in Terminal. Hidden input; token stays outside Git in a 0600 file. Do not send it through chat.

The local Studio was resumed on 127.0.0.1:4318 with the same data directory. Startup links/session keys are ephemeral; use the current Terminal output. Configuration reads the credential file on each resume, so no restart is required after owner setup.

After credentials: exactly one newly approved test article version/destination is required for real PR → protected review/merge → matching main deployment → public verification → personal-vault archive E2E. No remote PR or publication has been attempted. Required independent review and vault-main approval remain in force. Do not report Archived without real evidence.

## Native authorization repair — 2026-11-01
- Replaced terminal/TTY-only setup with an NSSecureTextField macOS window in the existing configure-github entry point; added the same entry to the existing Studio UI.
- Runtime credentials now come exclusively from the dedicated macOS Keychain item, not environment variables, plaintext files, chat or browser persistence. The helper returns secrets only through an internal Worker pipe; authorization stdout/evidence contains only non-secret results. No model-facing token reads.
- No quarantine attribute was present on the script; no Gatekeeper/security setting was weakened. Existing command was executable but had no native input UI and relied on Terminal.
- Finder-safe Codex binary resolution repaired. Actual authenticated Codex probe succeeded at 2026-11-01T04:12:40Z; no article data or publication.
- Native helper compiled successfully. Targeted auth/gate/worker-stop tests: 5 passed; typecheck and lint passed. Native owner input completed. GitHub read-only repository/PR/Actions verification succeeded at 2026-11-01T04:14:35Z; credential saved by Security.framework to macOS Keychain. Worker-side post-save API and Git read-only checks also succeeded. Fixed root GitHub API trailing-slash bug (regression test failed then passed). No secret was read by the agent or placed in logs/files.

## Test PR acceptance — 2026-11-01 (current)
- GitHub Keychain credential verified against repository/PR/Actions read endpoints and Git transport. Actual write permissions proven by scoped branch push and draft PR creation.
- Real browser uploaded and validated new test Markdown job `8c947935-ea24-4c3c-b76e-96b951fa7f7a`. Original unapproved acceptance job is untouched.
- Same actual Worker invoked Codex for this exact manifest, ran applicable content/app/security/architecture gates and built/validated the new article export. Failed integration steps were repaired and resumed without rerunning completed gates: external dependency symlink → worktree-local offline locked install; worktree-local Next CLI avoids mixed module instances; Git commit uses authenticated actor public noreply identity per command, without changing global config.
- Draft PR #112: https://github.com/paulzhang901-jpg/paulzhang-website/pull/112
- Branch `codex/studio-8c947935-ea24-4c3c-b76e-96b951fa7f7a`; head `b8a4d054828f80bebda232eb1ae76518bed7b5de`. Exactly one added article: `content/zh-CN/library/publishing-studio-acceptance-20261101-bf98d0fd.md`.
- Authorization is preparation-only (`prepare-pr`), not publication. Worker halts before protectedMerge. PR is draft/open/unmerged. main remains `3021c70bf4bfdea95f12ffedabc897fd415430a4`. No production deployment or test-article personal-vault write.
- Actual existing personal Vault archive adapter returned bodyVerified + noOp for the already published Halloween article, with exact Git/Obsidian body hash equality. This confirms live vault duplicate/byte-comparison access, not new-article post-publication archival. Earlier isolated write/idempotency/conflict test evidence is retained, not rerun.
- Durable details: this job's events.jsonl, pr-only-evidence.json, vault-readonly-evidence.json and private executor diagnostics outside Git.
- New scoped regression checks for PR-only authorization and authenticated commit identity passed. Typecheck, lint and diff whitespace checks passed.
- Workbench implementation itself is still local on `codex/publishing-studio-mvp`, pending code review/integration. Full production E2E still requires exact-version publication authorization, required GitHub checks/review, normal main merge/deployment, live route verification, and post-publication archive verification. Do not infer publication authority from this PR test.

## Final live acceptance — 2026-11-01
- Owner's final completion instruction bound publication approval to PR #112 head b8a4d054828f80bebda232eb1ae76518bed7b5de and its exact uploaded body/metadata/destination hashes.
- PR #112 normally merged without bypass to main commit 174729cdf61ae78b964e0fab7e4fbf4856c6bf8f.
- Matching existing production workflow 41273833499 succeeded: https://github.com/paulzhang901-jpg/paulzhang-website/actions/runs/41273833499
- Actual public route verified HTTP 200, exact canonical, title and body: https://paulzhang.org/library/publishing-studio-acceptance-20261101-bf98d0fd
- Actual Vault archive commit 366614bf38e3cb35e1b751f46666d4f3cbec53de on dedicated branch codex/studio-archive-8c947935-ea24-4c3c-b76e-96b951fa7f7a; original dirty Vault checkout untouched. Archive and approved website body SHA256 both c251c5660aa727e311a70eee04897e05f2e08f748ad8e88e120d1ff0d0be7d70. Vault main integration remains owner-controlled; this is verified archive-branch storage, not a silent merge into active Vault/main.
- Mac Studio isolated website checkout fast-forward synced to merged main while all 30 pre-existing implementation files retained identical hashes.
- iCloud full-checkout failure recovered with minimal sparse archive worktree. Sparse index bootstrap initializes from HEAD and commits only the new note. Per-command authenticated actor noreply identity avoids missing global Git identity.
- Independent code review found two issues, both fixed by RED→GREEN regressions: rendered Markdown lists/quotes/short text verification, and exact staged archive recovery after commit failure. Three affected archive/verification tests passed; resume-after-main-sync regression passed. No unaffected full suite was rerun.
- UI must distinguish archive-branch verification from pending Vault integration; stale archive-failure publicationStatus is cleared on verified completion.
- Remaining integration gate: Studio implementation is separate from article publishing and requires ordinary owner code review/merge under ADR-0044 (the article automatic-merge exception does not authorize it).
