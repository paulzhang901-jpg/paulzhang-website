# Static Production Deployment Contract v2

## Scope
This contract implements ADR-0015's hosting decision and ADR-0021's automatic production-promotion decision. Production remains Next.js static export hosted by the existing Cloudflare Pages Direct Upload project `paulzhang-website-preview`. No dashboard Git integration, DNS change, custom-domain change, application runtime, or second hosting architecture is introduced.

## Build contract

| Setting | Required value |
|---|---|
| Install | `corepack enable` then `pnpm install --frozen-lockfile --ignore-scripts` |
| Build | `pnpm run build` |
| Artifact validation | `pnpm run validate:static-export` |
| Output directory | `out` |
| Node | 24 in CI; application minimum remains `>=20.9.0` |
| pnpm | 11.19.0 from `packageManager` |
| Runtime | None; static files only |
| Runtime secrets | None |

CI must use the repository-standard `pnpm run build`. The exact validated `out/` directory from that build is the only production upload artifact.

## Cloudflare Pages contract

| Setting | Required value |
|---|---|
| Project | `paulzhang-website-preview` |
| Production branch | `production` |
| Production domains | `paulzhang.org`, `www.paulzhang.org` |
| Deployment method | Wrangler Pages Direct Upload |
| Authentication | GitHub Actions secrets only |

Production command shape:

```text
wrangler pages deploy out --project-name=paulzhang-website-preview --branch=production --commit-hash=<main-sha>
```

The workflow must not alter DNS or custom-domain configuration.

## Automatic production gate
Production deployment is authorized only for a GitHub Actions `push` event on `refs/heads/main`, after all existing architecture, application, content, security, and aggregate validation jobs succeed. Pull requests and feature branches run validation but never execute the production deployment job and never receive Cloudflare credentials.

The production job rebuilds from the exact triggering `main` SHA after validation, validates static export again, then uploads that exact `out/`. This intentionally favors deterministic provenance over reusing a mutable workspace from another job.

A `production-deploy` concurrency group prevents overlapping production deployments. Production smoke checks must succeed for `https://paulzhang.org/` and `https://paulzhang.org/library` after upload.

## Secrets
Required GitHub Actions repository secrets:
- `CLOUDFLARE_API_TOKEN`: least-privilege token with Cloudflare Pages deployment/edit permission for the account containing the approved project.
- `CLOUDFLARE_ACCOUNT_ID`: the Cloudflare account identifier.

Secrets must never be committed, echoed, copied into artifacts, exposed to pull-request jobs, or placed in repository variables or `.env` files.

## Preview security
- Feature branches do not deploy through this production workflow.
- `public/_headers` is copied into `out/`; Cloudflare preview noindex behavior remains governed by the existing header contract.
- Only validated static output is uploaded; canonical intake/configuration directories are not deployment artifacts.

## Cache and security headers
`public/_headers` is copied into `out/`. Fingerprinted `/_next/static/*` assets receive one-year immutable browser caching. Non-fingerprinted `/images/*` receive a one-day browser cache. HTML must not receive immutable caching.

Launch headers retain same-origin CSP, clickjacking protection, MIME sniffing protection, referrer policy, and minimal permissions policy.

## Rollback and recovery
Identify production versions by commit SHA and Cloudflare deployment ID. Prefer rollback through Cloudflare immutable deployment history. If provider rollback is unavailable, check out an approved prior commit, install from the frozen lockfile, rerun every gate, build and validate `out/`, and explicitly deploy that validated artifact with authorized credentials. Never reset `main` merely to roll back production.

If an automatic deployment fails, do not bypass validation. Correct the deployment/configuration problem through a reviewed PR or perform an explicitly authorized rollback using the procedure above.
