# ADR-0035 — What Is True Faith multimedia preparation
Status: Accepted — bounded local preparation requested directly by Paul in Phase 7E; publication/deployment remain unauthorized
Date: 2026-10-19
Scope: V1; architecture extension to video child routes and isolated local review

## Decision before implementation
Add canonical video discovery detail routes /videos/[slug] and /en/videos/[slug], resolving only the existing canonical content and media lookup. No video-owned article bodies or second publishing system.
Store the exact approved bilingual bodies as canonical library MDX with status review and NO published_at. Retain synthetic voice disclosure and existing audio player. Store source/audio/video/subtitle approval and hash bindings in a non-runtime preparation release record, with publicationAuthorized=false. Keep production narration/video catalogs unchanged until a separate reviewed release.

## Local review boundary
A task-specific build preparation script copies the current website source to an ignored, isolated local build workspace, reusing the same Next.js app, repository, players, route templates and build commands. Only this disposable fixture workspace projects the two approved records/media into the public lookup shape to exercise the future release. Fixture dates are internal build necessities, never canonical publication records; hide publication dates in preview UI and display a prominent NOT PUBLISHED banner plus noindex. Media copies stay in ignored local artifacts, never Git or production public/.
The normal production build remains independent, with both candidate articles and videos excluded. No production environment flag or draft-exposure branch is added. The preview build cannot become a deployment artifact: existing deployment continues using the normal root out/; preview output lives under artifacts/local-publication. This is local QA of the existing system, not an alternate publication channel.

## Phase 7F.3 — Accepted bounded public mobile preview
Paul explicitly authorized an isolated public Cloudflare Pages preview on 2026-10-19. This supersedes this ADR's local-only restriction for this one test artifact, not production release governance. Classification: V1 ARCHITECTURE EXTENSION to the preview release boundary.
Reuse the already validated isolated static export and approved asset bytes. Prepare a separate ignored public-test export, retaining visible TEST PREVIEW / NOT PRODUCTION labels and noindex. Its fixture lookup data is test scaffolding, never a production approval event. Upload only to a distinct non-production branch in the existing project paulzhang-website-preview after checking the project's production branch. Do not merge/push main, alter production domains, deploy normal root out, or relax security/Access account settings. No new provider or YouTube.
Allow preview-only output preparation under artifacts/local-publication and the existing readiness report, plus this ADR and the static deployment contract. Preserve the original local fixture and its NOT-FOR-DEPLOYMENT guard. Exclude configuration/source/auth files from public output, disable analytics on test output, and use same-origin public media URLs. The new output is eligible only for this explicitly authorized public test deployment. Unknown mainland/mobile results must remain unverified until actually tested.
Owner: Paul. Goal/acceptance: real-phone URLs reachable over public HTTPS, both language pages and exact media, MIME/Range/download checks, noindex/security headers, unchanged production deployment. Temporary lifetime: manual removal after Paul confirms testing; do not promise automatic expiry. Record deployment ID/branch and cleanup command. No automatic production promotion.

## Phase 7F.5 — Accepted temporary branch custom domain
Paul explicitly approved adding only mobile-test.paulzhang.org on 2026-10-19 after declining Zero Trust usage-charge authorization. This is a bounded preview-hosting extension, not a production release. Reuse existing Preview deployment a4336f9e-3b08-4fd2-9480-5f6319fee6ee on phase7f3-faith-mobile-test; no rebuild/upload. Add only this temporary Pages custom domain and its proxied CNAME to phase7f3-faith-mobile-test.paulzhang-website-preview.pages.dev, per Cloudflare's custom-branch procedure. Never modify apex/www records, existing Access apps/policies, production branch or production deployment. If an existing mobile-test record conflicts, stop rather than overwrite. No Zero Trust activation, new paid plan, purchase or credential extraction. Verify test banner, approved asset hashes, noindex, public anonymous HTTPS/media and unchanged production identity before providing ready URLs. Mainland/mobile claims require actual tests. After Paul confirms completion, remove only the temporary custom domain/CNAME and test deployment. Allowed Paths extend only to those host settings and existing readiness/archive documentation. No route/taxonomy/content schema change.

## Impacts
Identity/taxonomy/i18n unchanged; canonical ID article-what-is-true-faith, both locale slugs what-is-true-faith. Video detail identity derives from canonical slug. Add reciprocal detail links, related reading/audio, canonical/hreflang and sitemap entries only for actual published video records. Empty dynamic routes reuse the existing build-only placeholder convention; remove placeholders from validated export.
Hosting: existing same-origin Cloudflare Pages/static export; actual media all under its 25 MiB per-file limit, but no production asset transfer/CDN configuration is activated. CSP remains same-origin; no YouTube. Mainland access UNVERIFIED absent a real mainland probe.
No generation, model, voice, article body, analytics, credentials, upload, purchase, commit, push or deploy change.

Allowed Paths: this ADR/index, route/content architecture notes, route registry; two new review MDX records; preparation release record; video lookup/component/detail routes/metadata/sitemap; relevant tests and package test registration; local QA scripts/report; ignored artifacts and .gitignore entry; tsconfig exclusion of the ignored local build copy to prevent duplicate source checking. Published bodies, existing audio players/catalog, release workflows and hosting credentials remain read-only.

## Acceptance
Exact body/asset hashes; default production exclusion; approved private preview showing both article players/downloads, video listings/detail pages, reciprocal locale links and captions; targeted tests, production and isolated preview builds; static export checks, responsive/browser playback checks where available. Real iPhone and mainland verification remain explicit limitations unless actually measured.
## Supersedes
ADR-0034's absence of video detail routes only; production release governance remains unchanged.
## Superseded By
None.
