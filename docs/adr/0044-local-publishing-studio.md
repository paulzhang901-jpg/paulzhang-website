# ADR-0044 — Local One-Click Publishing Studio

Status: Accepted
Human Approval: Paul Zhang explicitly selected approach B on 2026-10-31; architecture decision only, no implementation authorized in this task
Date: 2026-10-31
Integration note: Originally approved under working draft number ADR-0037. Renumbered to ADR-0044 during integration because main already contains accepted ADR-0037 for repeatable video releases; the approved Publishing Studio decision is unchanged.
Owner: Paul Zhang
Classification: ARCHITECTURE CHANGE
Version boundary: V1 editorial operations tooling; no new public V1 route or V1.5 identity feature

## Goal

Upload finalized Markdown on the Mac Studio, preview its exact body, approve a specific article version, and publish through the existing repository and ADR-0021 pipeline. Verify the public article, then synchronize the existing Paul AI Brain archive. Never claim completion before both verifications.

## Existing system and conflict

Repository: https://github.com/paulzhang901-jpg/paulzhang-website.
Existing content parsing, schemas, taxonomy and locale routing live under src/lib/content, schema and config/architecture. The existing Quality gates workflow validates PRs and deploys only validated main static exports to the existing Cloudflare Pages project.

ADR-0021 states that branch protection and PR review remain the human authorization boundary. A worker that automatically merges owner-preapproved articles changes that release boundary. Local upload storage and Codex access introduce additional privacy and AI execution boundaries. This accepted ADR narrowly supersedes that human merge boundary only for the exact finalized articles and authorization contract below. It does not override required GitHub checks or independent review requirements.

The current checkout contains unrelated changes and is on codex/phase-7e-faith-publication-prep. Implementation must use an isolated worktree based on freshly verified main; preserve this checkout.

## Approaches considered

1. Selected by Paul Zhang on 2026-10-31: local browser workspace and local worker in this repository, outside the public Next.js application. Reuses content and deployment infrastructure, keeps credentials on the Mac, and requires no hosted service.
2. Public hosted Studio with a bridge to the Mac: requires additional identity, remote access and network security architecture. Defer.
3. Upload-to-PR only: preserves the existing human merge boundary, but does not deliver the requested unattended publishing flow. Available fallback if automatic merge is declined.

## Decision

Bind the Studio to loopback only. Serve UI and API from one origin, validate Host and Origin, use a local session/CSRF mechanism, and never enable wildcard CORS. Do not add /studio to public routes. Use existing Node dependencies where practical; add no paid service.

Preserve original upload bytes in a private local job directory outside Git and public assets. Accept bounded UTF-8 .md uploads only. Generate job IDs and paths server-side; reject traversal, symlink escapes and executable MDX. Render a sanitized preview without executing uploaded HTML, JavaScript or MDX. Treat article text as untrusted data, never as worker instructions.

Reuse repository content validation and taxonomy. Require only unresolved mandatory metadata, showing the proposed canonical ID, locale, slug, repository path, visibility and public URL before approval. Do not infer private material is public, silently translate, modify Scripture, or rewrite finalized bodies. Preserve body bytes and record source and approved-output hashes.

Use a fixed server-owned invocation of the installed Codex CLI (observed version 0.147.0; codex exec supports JSONL events and output schemas). Do not accept executable commands or prompts from the browser. Use workspace sandboxing and a dedicated worktree; never bypass approvals or expose credentials. Confirm actual authenticated execution separately: installation and --help are not execution acceptance evidence.

Prefer deterministic code for parsing, validation, Git operations, status observation and archive comparison; invoke Codex only for bounded tasks that actually require it. Do not send the whole vault or unrelated files to the model. Capture private executor diagnostics separately from a redacted browser event log.

A user-reviewed, finalized Markdown article is eligible for automatic publication. The owner must explicitly authorize publication of the exact version, either through a previously recorded approval verified by the worker or by clicking the Studio publication action after reviewing its final preview and destination. Upload alone, a frontmatter flag, or instructions inside Markdown do not establish authorization. The Studio must clearly explain that this action authorizes the scoped branch/PR, normal protected merge, main deployment, public verification and archive synchronization, without repeated routine confirmations.

Each approval binds the authenticated local owner action or verifiable prior approval, canonical ID, locale, original-upload hash, final body and metadata hashes, destination, visibility/access, publish intent and approval timestamp. Any editorial or destination change invalidates approval. Runtime publication timestamps and resulting Git/deployment/archive evidence may be filled deterministically under the approved policy and must be audited; they cannot change the body or approved destination. Missing mandatory editorial metadata must be resolved before approval. No broad future-article authorization is inferred from this ADR. Create exactly one scoped feature branch and PR per job. Never force-push, overwrite existing content, delete files, change permissions, weaken protections or deploy a branch. Stop on collisions or unexpected diffs.

Narrow supersession of ADR-0021: the worker may request normal protected merge for that exact owner-approved article version only after required checks and review requirements pass. It must not self-approve a required independent review or bypass GitHub protections. If repository policy requires another human reviewer, remain waiting with the concrete reason. No additional manual merge confirmation is required for a job satisfying this contract. All other merges retain the existing human authorization boundary. This exception does not authorize merging Studio implementation, architecture changes or unrelated repository work.

Stop before mutation on abnormal overwrite, deletion, permission changes, private/restricted publication, existing-ID/path conflicts, unexpected diffs, changed approval hashes, failing checks, unavailable authorization, or archive body conflicts. Ask for the specific exceptional action and never treat silence as consent. Failed tests and deployment/verification errors halt automatic progression; report the failure rather than bypassing it. A retry must re-observe external state and remain bound to unchanged approval.

Deploy exclusively through the existing main GitHub Actions production job. Bind job evidence to the actual merged commit and successful deployment run; a green PR or successful Codex exit is insufficient. Verify exact locale routes, canonical identity and expected article content, rejecting redirects to unrelated pages and soft 404s. If newer main has deployed, verify the article's approved source is still present in that deployed revision.

After website verification, follow the vault AGENTS.md and existing archive conventions. Search ID, slug, titles and URLs before writing. Preserve local notes; stop on body conflicts; unchanged archive is a no-op. Record canonical ID, locale, category, public URLs, source paths, approved Git commit, actual publication timestamp, author and status. Compare archive bodies against Git bytes. Vault work must use its dedicated branch and retain its merge-approval boundary; never silently merge vault main. Discover and assess existing archive tools before adding an adapter.

## Durable state and evidence

Required visible stages: Uploaded → Validated → Publishing → Deployed → Website Verified → Archived; Failed records the actual failing step. Add a separate waiting reason for missing metadata, approval, required review or external permissions; never convert waiting into success.

Uploaded requires durable bytes and checksum. Validated requires actual validators and bound metadata. Publishing requires a real queued/running execution. Deployed requires the matching successful production deployment. Website Verified requires public route/content checks. Archived requires duplicate checks and exact-body archive verification. If archival fails after deployment, retain website success and display WEBSITE PUBLISHED / OBSIDIAN ARCHIVE INCOMPLETE.

Persist append-only transitions, timestamps, input/output hashes, scoped diff, PR, commit, deployment and archive evidence. Redact credentials, access-bearing URLs and private content. Serialize repository mutations. Resume by observing existing branch/PR/deployment/archive state; never duplicate a PR or replay a merge blindly after restart.

## Implementation contract — future task

- Goal: real upload-to-publication-to-archive, with evidence.
- Owner: Paul Zhang; implementer: Codex.
- Scope: local Phase 1 finalized Markdown editorial publishing only.
- Planned allowed paths (confirm in the future implementation task): tools/publishing-studio/**, tests/publishing-studio/**, package.json and lockfile only if needed, this ADR and directly affected architecture/operational docs. Article job worktrees may change only their approved content paths. Vault archive paths must be identified from existing records before writing.
- References: ADR-0003/0004/0009/0011/0012/0015/0021; CONTENT_MODEL, TAXONOMY, PRIVACY_MODEL, AI_BOUNDARIES, RELEASE_BOUNDARIES; both AGENTS.md files.
- Analytics: no public events; private local operational evidence only.
- Privacy: uploads and executor credentials stay local except approved article data sent to the authorized Codex executor and published source sent to GitHub; no generic analytics or raw private logs.
- ADR impact: this ADR narrowly supersedes ADR-0021’s per-merge human authorization requirement for eligible article jobs only. ADR-0021 remains an unchanged historical record. Architecture, release, AI and privacy documents reference this decision; no public route, content schema, taxonomy or event registry changes are required by this documentation-only decision. Future implementation must review whether additional registry/schema changes are needed.

## Acceptance and tests

Unit/integration checks must cover malformed YAML, invalid metadata, non-UTF-8/oversized uploads, traversal, symlinks, HTML/MDX injection, prompt injection containment, cross-origin requests, duplicate IDs, changed approval hashes, unexpected diffs, CLI errors, failed CI, deployment mismatch, soft 404s, archive conflicts and restart idempotency.

Run existing applicable content, translation, architecture, application, security and static-export gates. Review the scoped diff and privacy boundary before integration.

Real end-to-end acceptance uses a finalized test article whose exact body and public destination have been approved: upload through the browser, execute the real worker, create one PR, satisfy protection/review, merge normally, observe existing production deployment, fetch and verify the actual article, archive using vault conventions, compare bodies and show evidence-backed Archived. Do not publish a fabricated test article merely to make the dashboard green.

## Current evidence and limitations

Read-only inspection confirmed repository content/CI/deployment infrastructure, Codex CLI installation/help, and vault governance. No authenticated Codex job, upload UI, worker, deployment, archive write or end-to-end test has run. No startup command exists yet. This accepted decision is not an implementation or a publication-success report. Architecture acceptance does not mean the documents have been reviewed, merged or synchronized to another checkout. No application, worker, package, workflow, content or vault change is authorized by this documentation-only task.

## Next steps — after a separate implementation instruction

1. Review and integrate this documentation-only decision through the normal repository process.
2. Create implementation plan and isolated worktree.
3. Implement local upload/preview, durable jobs and bounded executor.
4. Integrate protected PR/main deployment observation and archive adapter.
5. Run failure-path tests and real browser acceptance using an approved article.
6. Report verified startup command, actual evidence and remaining blockers.


## Supersedes

ADR-0021 only insofar as it requires a separate human merge action for every eligible, exact-version owner-approved Markdown article job. Hosting, protected PR review/checks, main-only deployment, static export, production credentials and rollback remain unchanged. No supersession of vault governance.

## Superseded By

None.

## Synchronization to Mac Studio

Use Git as the synchronization source; do not copy individual files into an unrelated dirty checkout. Create a documentation-only branch/PR containing this ADR and its related architecture references, review and merge it through the existing process. This task does not itself merge or publish that PR. The ADR is accepted by the owner; integration status is separate.

On Mac Studio, inspect `git status --short` in the website checkout first. For a clean checkout already on main, run `git fetch origin` followed by `git pull --ff-only origin main`. If the checkout contains work or is on a feature branch, preserve it and use a separate worktree from `origin/main` after fetching. Verify ADR-0044 says Accepted, its commit is included, and all related document changes are present. Do not reset, clean, stash or overwrite unrelated work automatically. If both sessions use this same physical checkout, the saved files are already local, but they are not yet in GitHub main.

## Documentation acceptance evidence

Required before reporting this documentation task verified: inspect the scoped diff, run architecture validation/tests and `git diff --check`, and record their actual results in the handoff. Implementation and real upload/deployment/archive acceptance remain unrun.
