# ADR-0043 — Prayer and peace: unchanged independent sermon video delivery

Status: Proposed — Phase 6.2 authorizes publication of the approved video; storage activation and website-specific release evidence remain pending
Date: 2026-10-30
Owner: Paul Zhang
Classification: ARCHITECTURE EXTENSION
Version boundary: V1, one Chinese standalone sermon in the existing Videos section

## Goal and exact source

Publish “祷告之后，为什么仍不平安？” (Philippians 4:7), preserving the human-approved Phase 6.1 MP4 byte-for-byte: SHA-256 `695e6cec2906c666727bc937da45ecaa84a4a4bb5f61553bd10196ce6f04aca8`, 35,985,439 bytes. Original recorded speaker/voice; symbolic animation, not a synthetic narrator. Reviewed SRT: `cf78a7d367d9fd7d9ce347ab2c8f0c2510caaab95c6d5520714d2fd22097ed87`, 7,745 bytes. No rendering, recompression, splitting, retranslation, generated article/audio or replacement of existing media.

## Proposed bounded integration

Reuse `/videos` and `/videos/[slug]`, canonical video catalog, existing native HTML5 player (`controls`, `playsInline`, responsive aspect ratio), GitHub PR checks and ADR-0021 main-only deployment. Intended existing-route instance: `/videos/peace-after-prayer`; canonical ID `video-sermon-prayer-peace`. Permit this single approved standalone sermon to use that detail projection rather than the current biography anchor constraint. No new section, route family or component.

Host the exact MP4 in independently served object storage outside Git; keep existing Pages media budgets and existing releases unchanged. Prefer Cloudflare R2 in the existing Cloudflare account. Require an owner-enabled account, known final HTTPS origin, immutable hash-addressed object, `video/mp4`, byte-range/206 support, and CORS allowing the website's exact origins because the existing player uses `crossOrigin=anonymous`. Public access must not require expiring credentials. Confirm storage/billing terms with the owner; do not activate a billing agreement, accept terms, alter DNS/security settings or create an unapproved paid subscription automatically. Do not call an r2.dev development endpoint a verified production host.

The website must contain no YouTube iframe, source, activation button or fallback for this release. Do not remove unrelated previously approved YouTube videos. The independent YouTube publication is separate: `BJK5tloWFUM` on existing channel `UCij02113c9lnl5oZeRKbE6Q`; it is not a website playback source.

## Current concrete blocker

Cloudflare R2 bucket-list API returned code 10042: “Please enable R2 through the Cloudflare Dashboard.” No enabled R2 bucket exists for this account at this checkpoint. The MP4 exceeds both the existing 25 MiB governed local-media ceiling and Pages' direct-file limit. No silent Git/media exception or substitution is permitted. Candidate metadata remains PENDING and no runtime catalog entry is added.

## Delivery gates and allowed paths

Allowed paths for the eventual bounded implementation: this ADR/index and relevant release-boundary reference; exact pending/release metadata; existing published-video resolver/schema, release-policy validator, existing video-detail static params and resource label only as necessary; small existing approved auxiliary files and targeted tests. Keep all unrelated article/audio/player behavior and catalog entries unchanged. Do not grant a generic external-video exception.

After an independent host is available, bind its exact URL/hash/bytes in reviewed release evidence; prepare and validate the existing protected preview; test audible playback, pause/resume, seek and fullscreen on desktop and iPhone Safari, native playback and CORS/range delivery, captions and old-video regression. Owner's Phase 6.1 content approval is not represented as an actual iPhone website test. Preserve authenticated human exact-final-head GitHub acknowledgement, required reviews/checks and normal protected main merge. No feature-branch production deployment or fabricated approval. Phase 6.2 supplies production intent but does not prove these future gates happened.

Verify live `/videos` discovery and detail page, direct independent URL and downloaded exact hash, HTTP MIME/CORS/range responses and no YouTube requests from this page. Archive true website/YouTube states and local source pointers in Paul AI Brain; do not label an unpublished website complete.

## Impacts and rollback

Analytics: no new events. Privacy: no YouTube connection on this release's page and no new personal-data collection; document final independent host. Content: single approved video identity, no duplicate manuscript. Dependencies: none. Hosting: pending scoped external-object decision only; existing website deployment remains unchanged. Rollback by reviewed removal of this exact catalog reference, preserving immutable MP4 and archive. No existing content or media deletion.

## Provider references

- Pages file limit: https://developers.cloudflare.com/pages/platform/limits/
- R2 activation/checkout is owner-operated: https://developers.cloudflare.com/r2/get-started/
