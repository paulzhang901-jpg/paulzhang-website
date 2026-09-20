# ADR-0021 — Automatic Main Production Deployment
Status: Accepted
Date: 2026-09-20
Human Approval: Approved 2026-09-20

## Context
ADR-0015 selected Next.js static export and Cloudflare Pages Direct Upload, but required manual production promotion and prohibited automatic deployment from `main`. The production path has since been proven manually against the existing Cloudflare Pages project `paulzhang-website-preview`: the repository-standard build produces `out/`, Wrangler Direct Upload can publish that exact artifact to the `production` branch, and the custom production domains serve the result.

Manual promotion leaves a gap between an approved merge and the public site. The owner has explicitly authorized closing that gap so ordinary publishing ends at PR merge while preserving all existing validation gates.

## Decision
Supersede only ADR-0015's manual-promotion policy. Keep its hosting architecture, static-export contract, Cloudflare Pages project, custom domains, and rollback model unchanged.

A push to `main` triggers the existing Quality gates workflow. The production deployment job runs only for `push` events whose ref is `refs/heads/main`, and only after the aggregate `validate` job succeeds. It installs from the frozen lockfile, runs the repository-standard production build, validates the generated static export, and Direct Uploads the exact `out/` directory to Cloudflare Pages project `paulzhang-website-preview` with branch `production` and the triggering commit SHA.

Pull requests and feature branches never receive production credentials and never execute the production deployment job. Cloudflare authentication is supplied only through GitHub Actions secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. A production concurrency group prevents overlapping production uploads.

After upload, CI performs smoke checks against `https://paulzhang.org/` and `https://paulzhang.org/library`. A failed smoke check fails the workflow and requires investigation or rollback; it does not change DNS or custom-domain configuration.

## Alternatives Considered
- Keep manual promotion: rejected because the owner explicitly requires merge-to-main publishing automation.
- Cloudflare dashboard Git integration: rejected because it would introduce a second deployment control plane and bypass repository validation ordering.
- Change hosting provider or runtime: rejected; the proven Direct Upload architecture already satisfies production requirements.

## Consequences
A successful merge to `main` now has production side effects after validation. Branch protection and PR review therefore remain the human authorization boundary. Repository secrets must remain least-privilege and must never be available to pull-request jobs.

Rollback continues to use Cloudflare immutable deployment history when available. Otherwise, rebuild an approved prior commit with the frozen lockfile, rerun all gates, and deploy that validated artifact. Never reset `main` merely to roll back production.

## Implementation Notes
The workflow pins the proven Wrangler CLI version used for the successful manual deployment. No DNS, custom-domain, content, application behavior, or design changes are part of this decision.

## Supersedes
ADR-0015 production promotion policy only. ADR-0015 remains authoritative for hosting/static-export architecture.

## Superseded By
None.
