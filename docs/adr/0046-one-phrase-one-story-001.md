# ADR-0046 — One Phrase, One Story and Episode 001

Status: Accepted for the exact owner-approved Phase 1.1 scope, with activation gated on the media and protected merge below.
Owner: Paul Zhang
Classification: V1 architecture extension

## Decision

The owner's Phase 1.1 production instruction approves the reviewed series landing at /videos/one-phrase-one-story, the first episode at /videos/one-phrase-one-story/001 and direct delivery of the original 1920×1080 MP4. The owner confirms WeChat Channels was first and the required 24 hours have elapsed. The exact WeChat timestamp and URL were not supplied. No later episode is authorized.

Add the two Chinese routes within the current video section, with the supplied Chinese and English copy on the same pages. Reuse existing site layout and official brand. The approved episode record is the sole source for the list and detail pages. Leave the existing canonical article and video catalogs, events, privacy, and other routes intact.

Apply the direct GitHub Release delivery pattern from ADR-0043/0045 only to the exact SHA-256-bound file in the episode record. The 45,907,753-byte original exceeds the existing 25 MiB repository-video budget. Only the small cover and subtitle assets belong in Git. The native video element requires no cross-origin text-track requests because the caption display is embedded. Restrict the CSP addition to the exact Release asset URL. No new service, subscription, analytics or dependency.

## Acceptance

Confirm unauthenticated download of the original SHA-256 and successful byte ranges before merge. Review through required GitHub checks and protected main; retain normal independent review and the existing Cloudflare Actions production workflow. Verify both public routes, audible playback, seeking, fullscreen and desktop/mobile presentation on the actual production site. Revert the scoped route and delivery binding through a reviewed change if rollback is required.

## Phase 1.2 Safari playback amendment

Native desktop Safari returned MEDIA_ERR_SRC_NOT_SUPPORTED (code 4) for the GitHub Release source, including in an isolated page with no site JavaScript. The same exact local MP4 was accepted with both video and download response headers. GitHub still returns correct bytes to HTTP clients and Chrome. Use the existing Cloudflare Pages Direct Upload project's file-based Function for this exact video path. The page loads the same-origin MP4. The Function streams the fixed Release asset, preserves byte-range semantics and serves inline video/mp4. No other URL invokes the Function. The original MP4 stays outside Git and the existing Pages asset limit still applies. This narrowly extends the static deployment contract for one media route and requires no new project, binding, service subscription or content changes.
