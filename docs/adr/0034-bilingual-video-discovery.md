# ADR-0034 — Bilingual video discovery
Status: Accepted — bounded Phase 7B integration authorized by Paul's direct request; no media publication or deployment authorized
Date: 2026-10-19
Classification: ARCHITECTURE CHANGE
Scope: V1 canonical-content discovery

## Context and owner direction
Phase 7A prepared an unmounted VideosSection. Phase 7B explicitly requests bilingual listing pages, navigation and canonical content integration. Record this route decision before implementation. Acceptance records that direct scope authorization, not a separate human review of this new document.

## Decision
Add /videos and its /en/videos locale projection to existing route/navigation/SEO conventions. Use a shared listing page and reuse VideosSection. Videos remain a discovery projection of published public canonical ContentItems, not a separate editorial source, taxonomy or article body. Resolve titles, Scripture, article paths and alternate titles from ContentRepository; resolve audio only through the existing published-narration lookup, without changing audio players.

An initially empty, strictly validated media-reference catalog links canonicalId + locale to a production MP4, poster, captions, actual video publication timestamp, source presentation hash and publication-event reference. No titles, bodies, article URLs or audio URLs are authored in that catalog. Only published production references whose canonical source is public and whose fingerprint matches the current normalized source are shown. Duplicate identities and invalid/YouTube media URLs are rejected. Catalog metadata is not authenticated author approval and never authorizes an upload: populated production records require a separately reviewed release.

## Impact review
Routes/navigation: one new V1 discovery namespace, no removals or redirects. Locale: existing unprefixed Chinese and /en English, paired canonicals/hreflang/sitemap. Content model: unchanged; separate media references only. Privacy/analytics: no new events, tracking, cookies or YouTube iframe. Static delivery: same Next.js export/Cloudflare Pages. No changes to articles, audio players, generation, hosting, upload, spending, protected releases or production deployment. Empty listings are genuine empty states, not sample media.

Allowed Paths: ADR/index; product IA; architecture route/content notes; routes registry; src/config/i18n.ts; src/lib/i18n/routing.ts; video catalog/lookup/page/component; Chinese video route; existing English shared resolver; header responsive breakpoints if needed; video tests and relevant route tests; package.json test registration; Phase 7B report. Existing Phase 7A files are retained.

## Alternatives
Library subsection only does not supply the requested dedicated bilingual listings/navigation. A separate video-content system would duplicate canonical content. YouTube-only embeds would violate independent playback.

## Acceptance
Paired static pages and navigation, canonical/hreflang/sitemap, localized empty state, canonical-only populated projection, Scripture/date, accessible native player/thumbnail/captions/related links, invalid/private/draft/stale records excluded; relevant architecture/routing/component tests, typecheck/lint and build/export verification. Actual media playback/mainland delivery await approved assets and host selection.

## Supersedes
Only Phase 7A's unmounted integration deferral for this bounded discovery surface; no existing accepted ADR decision is replaced.
## Superseded By
None.

## Exact YouTube exception

ADR-0038 permits only zh-CN sermon-revelation-9-20-21 / YouTube 0J44f6acTeQ using the existing layout and a visitor-activated official privacy-enhanced player. Existing independent videos and all other no-YouTube rules remain unchanged. Owner preview acceptance and final release gates remain mandatory.

ADR-0038 also records the owner-authorized preview-only extension for the exact official-channel hymn and Chinese biography references, without invented canonical articles. Specific production acceptance remains pending.
