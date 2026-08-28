# ADR-0015 — Production Hosting and Static Export Strategy
Status: Accepted
Date: 2026-08-28
Human Approval: Approved 2026-08-28

## Context
paulzhang.org is production-ready at the application layer but has no approved provider connection, deployment credentials, or DNS web records. The application uses Next.js 16 App Router, prerenders 133 production routes, has no API routes, Middleware, Server Actions, runtime database, runtime secrets, or external CMS, and keeps critical assets first-party. Before this decision, the build used the default Next.js runtime and image optimizer.

Phase 5A identified native Next.js hosting as a low-change option but required a static-export feasibility gate. Phase 5B proved that the complete application can produce a validated static artifact with LOW change cost: 133/133 production routes, 12/12 Fiction routes in each locale, canonical/SEO checks, 34/34 Fiction canonical hashes, and zero canonical byte changes.

China accessibility remains a first-class requirement. Generally reachable overseas hosting must never be represented as official mainland-China CDN acceleration.

## Decision
Adopt **Architecture B: Next.js Static Export + Cloudflare static hosting/CDN** as the primary production architecture. Retain **Architecture A: Vercel Native Next.js + Cloudflare authoritative DNS** as the approved fallback if static hosting later fails a release or operational gate.

Production promotion follows Model D: automatic PR preview when provider integration exists, Author visual review, PR approval, merge, main revalidation, approved release tag, immutable release candidate, explicit production authorization, manual promotion, and production smoke tests. A push to `main` must never deploy automatically.

Canonical packages and source cover assets remain byte-identical. Static delivery may serve originals or separately generated derivatives, but derived files must never replace or rewrite canonical sources. The initial implementation uses static-compatible first-party image delivery; a derivative-image pipeline requires a separately reviewed implementation boundary.

Cloudflare Global Network is not Cloudflare China Network. This decision makes no mainland-China availability guarantee and does not authorize ICP filing, China Network, a mainland deployment, or dual deployment.

This ADR authorizes production-architecture implementation and validation only. It does not authorize deployment, DNS changes, Cloudflare account mutation, domain mutation, credential creation, production promotion, or canonical editorial changes.

## Alternatives Considered

### A. Vercel Native Next.js + Cloudflare authoritative DNS
Compatibility, PR previews, image optimization, immutable deployments, and rollback are excellent, with the smallest code change and strong future dynamic-feature support. It has higher platform coupling and no mainland-China infrastructure or availability guarantee. It is retained as the fallback architecture.

### B. Next.js Static Export + Cloudflare static hosting/CDN
The accepted Phase 5B PoC exported all 133 production routes with bounded changes: export configuration, static-compatible image delivery, explicit static metadata routes, and a build-only non-public placeholder for the currently empty ContentUnit route namespace. The result has no application server, runtime secret, or origin process, has a small security surface, and is portable as static files. Cloudflare still provides only global reach unless a separately governed China service is adopted.

### C. Cloudflare Workers/OpenNext + Cloudflare authoritative DNS
This preserves dynamic Next.js capabilities but adds an adapter/runtime layer that the current application does not need. It creates more vendor coupling and operational surface than static hosting. It becomes relevant only when an approved future feature genuinely requires server runtime.

### D. Managed Node/VPS + Cloudflare authoritative DNS
It can run `next start`, but adds OS, Node process, TLS, proxy, patching, monitoring, scaling, and rollback responsibilities. The static-first application gains no proportional benefit from that surface.

## Comparison

| Concern | A Vercel | B Static + Cloudflare | C Workers/OpenNext | D Node/VPS |
|---|---|---|---|---|
| Current compatibility | Excellent | Good after LOW changes | Good after adapter PoC | Good |
| Next.js feature coverage | Excellent | Static features only | Good | Excellent |
| Operational complexity | Low | Low | Medium | High |
| Security surface | Low | Lowest | Medium | High |
| Immutable deployments | Excellent | Required by promotion contract | Good | Must be built |
| PR preview | Excellent | Required when integration exists | Good | Must be built |
| Rollback | Excellent | Immutable artifact/deployment | Good | Manual/custom |
| Image delivery | Excellent | First-party static; derivatives optional | Good | Must be built |
| Vendor lock-in | Medium | Low | Medium-high | Low |
| Migration portability | Good | Excellent | Acceptable | Good |
| Low/medium traffic cost | Good | Excellent | Excellent | Acceptable |
| China risk | Medium-high | Medium; no guarantee | Medium; no guarantee | Region-dependent |
| Maintenance burden | Low | Low | Medium | High |
| Future dynamic features | Excellent | Requires architecture extension | Good | Excellent |

## Consequences
The production application is a static artifact with no required application server. Every release must validate the full route inventory, canonical/hreflang output, robots, sitemap, 404 behavior, links, images, canonical hashes, and public/private boundary. Unknown dynamic paths depend on the static host's configured 404 behavior and must be tested in preview.

`next/image` uses unoptimized first-party URLs in the initial static model, so source images remain unchanged but receive no Next.js runtime transformation. Performance remains a blocking safeguard. A future derivative pipeline may generate separately named WebP/AVIF copies outside canonical source directories without modifying locked files.

Functionality requiring authentication, private state, forms, Server Actions, APIs, runtime content, or secrets does not silently reopen a server runtime. It requires architecture review and may supersede this ADR with Architecture A or C.

## Implementation Notes
The accepted Phase 5B change cost is LOW. The implementation must retain Model D, use a custom domain, keep critical assets first-party, avoid blocked third-party dependencies, configure HTTPS/security headers/clean URLs, and prove deterministic deployment and rollback from an approved release tag.

The Phase 5B managed sandbox could not run Turbopack's CSS worker because local port binding was denied. Authoritative GitHub CI must run the normal `pnpm build` command in a supported environment; webpack-only validation is not an acceptable substitute for production readiness.

## Supersedes
None.

## Superseded By
None.
