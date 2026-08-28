# Static Production Deployment Contract v1

## Scope
This contract implements ADR-0015 without connecting a provider or authorizing deployment. The selected target is Cloudflare Pages static hosting via prebuilt Direct Upload. Cloudflare authoritative DNS remains separately governed. Vercel native Next.js remains the fallback architecture.

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

CI must use the repository-standard `pnpm run build`. A webpack-only substitute does not satisfy the authoritative production gate.

## Cloudflare Pages contract
Use a prebuilt Direct Upload project so Git pushes do not automatically promote production. Provider connection and credentials require a later explicit authorization.

Future preview command shape:

```text
wrangler pages deploy out --project-name=<approved-project> --branch=<feature-branch>
```

Future production command shape:

```text
wrangler pages deploy out --project-name=<approved-project> --branch=<approved-production-branch>
```

These commands are documentation only. The project name, account ID, token, production branch, custom domain, and workflow do not exist in this implementation.

## Immutable deployments and promotion
Each upload must be tied to an approved commit SHA and release tag. Preview uploads never promote production. Production promotion requires an approved release tag, immutable candidate deployment ID, explicit human authorization, and a smoke test. A push to `main` must not deploy automatically.

## Preview security
- Preview uses no production credentials or runtime secrets.
- Cloudflare preview deployments must return `X-Robots-Tag: noindex`; `_headers` records the repository-side rule and provider behavior must be verified by `curl -I` before review.
- Preview may be protected by Cloudflare Access after separate account authorization.
- Only the validated `out/` artifact is uploaded; canonical intake/configuration directories are not part of the artifact.
- Public/private content and canonical-hash gates run before upload.

## Production behavior
- Custom domain intent: `https://paulzhang.org`; ownership and DNS authority must be proven before configuration.
- HTTPS certificate and HTTP-to-HTTPS behavior must be verified in provider preview/custom-domain setup.
- Apex versus `www` canonical redirect requires a separate DNS/domain authorization.
- Clean extensionless URLs and unknown-route `404.html` behavior must be verified on a provider preview.
- Cloudflare Global Network does not constitute official mainland-China CDN acceleration or guarantee mainland reachability.

## Cache and security headers
`public/_headers` is copied into `out/`. Fingerprinted `/_next/static/*` assets receive one-year immutable browser caching. Non-fingerprinted `/images/*` receive a one-day browser cache so same-name governed updates are not permanently stranded. HTML uses Cloudflare defaults and must not receive immutable caching.

Launch headers define a same-origin CSP, clickjacking protection, MIME sniffing protection, referrer policy, and a minimal permissions policy. Header behavior must be tested in preview; weakening it requires review.

## Rollback
Identify every production version by release tag, commit SHA, canonical hash evidence, and Cloudflare deployment ID. Roll back using the provider's immutable deployment history when available; otherwise rebuild from the approved tag with the frozen lockfile, rerun every gate, and manually promote only with authorization. Never reset `main` to roll back production.

## Secrets and GitHub Environment protections
No secret is created by this task. A future integration may require `CLOUDFLARE_ACCOUNT_ID` and a least-privilege `CLOUDFLARE_API_TOKEN` with Pages deployment permission. They must live in GitHub Environment secrets, never repository variables, committed `.env`, canonical packages, logs, or preview artifacts.

The future `production` GitHub Environment must require human reviewers, restrict deployment to approved release refs, prevent feature branches from reading production secrets, and retain deployment audit history. Preview should use a separate environment and token scope.

## Promotion model
Task approval → feature branch/worktree → implementation → deterministic validation → PR → automatic PR Preview when provider integration exists → Author visual review → PR approval → merge → main revalidation → approved release tag → immutable release candidate → explicit production authorization → manual promotion → production smoke test.

`main` push → automatic production is prohibited.
