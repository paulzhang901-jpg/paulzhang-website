# ADR-0043 — Prayer and peace: free independent original-video delivery

Status: Accepted for scoped implementation by the owner after PR #106 merged; final-head human approval and normal production merge remain required
Date: 2026-10-30
Owner: Paul Zhang
Classification: ARCHITECTURE EXTENSION
Version boundary: V1, one approved Chinese standalone sermon in the existing Videos section

## Goal and exact source

Publish “祷告之后，为什么仍不平安？” (Philippians 4:7), preserving the approved Phase 6.1 original MP4: SHA-256 `695e6cec2906c666727bc937da45ecaa84a4a4bb5f61553bd10196ce6f04aca8`, 35,985,439 bytes, 1920×1080, 267.7235 seconds. Original human voice, no synthetic narrator. Approved SRT: `cf78a7d367d9fd7d9ce347ab2c8f0c2510caaab95c6d5520714d2fd22097ed87`, 7,745 bytes. Do not rerender, recompress, alter content or upload YouTube again.

## Owner constraints and rejected paths

The latest owner instruction explicitly refuses R2, billing activation, credit cards, charges and quality reduction. The earlier R2 proposal and next-action instruction are superseded; do not ask for R2 activation again.

Pages supports multiple files, each <=25 MiB, but stream-copy splitting would preserve approximately 34 MiB total. Existing public/media is 259,912,231 bytes; ADR-0037's 256 MiB ceiling leaves only 8,523,225 bytes. Neither segmentation nor the retained 22.80 MiB compression experiment fits that total budget. Do not delete old media, enlarge budgets silently or introduce an unnecessary segmented player. The compression experiment is not the asset selected here.

## Free independent file — verified, not website-published

The existing public GitHub repository now has a Release media asset outside Git history:

https://github.com/paulzhang901-jpg/paulzhang-website/releases/download/sermon-prayer-peace-20261030/695e6cec2906c666727bc937da45ecaa84a4a4bb5f61553bd10196ce6f04aca8.mp4

GitHub reports `video/mp4`, the exact 35,985,439 bytes and a matching sha256 digest. The release is not marked Latest and does not deploy the website. No new subscription, credit card or R2 was used; existing GitHub Release assets have no storage/bandwidth quota in the cited provider documentation. This is a project media artifact, not a newly committed large Git blob.

Anonymous requests for an interior byte range returned HTTP206 and the correct Content-Range, served by release-assets.githubusercontent.com. The final CDN response uses application/octet-stream and has no Access-Control-Allow-Origin. Therefore it is incompatible with the current player's crossorigin=anonymous attribute; do not describe it as CORS-enabled or silently register a broken player.

A localhost native HTML5 player WITHOUT crossorigin, with source type video/mp4, successfully decoded 1920×1080, duration267.7235s, played actual images, exposed the full seekable range, sought to163.8s and entered visibly verified native fullscreen. This is desktop embedded-browser evidence, not an actual iPhone hardware test. Pause was not independently confirmed in that run. No official website playback is claimed.

## Proposed minimal integration (not implemented)

Reuse existing /videos and /videos/[slug], with exact ID video-sermon-prayer-peace and detail /videos/peace-after-prayer. Extend only this exact standalone sermon binding; do not change biography destinations, other videos, manuscripts, narration or taxonomy. Reuse VideosSection's native controls/playsInline player. Only when BOTH the exact canonical ID and immutable Release URL match may crossorigin be omitted; all other players retain their current attributes. No iframe, YouTube URL, canvas extraction, general proxy, Workers service, new dependency or arbitrary no-CORS option. Existing same-origin captions/SRT and any approved small poster may be referenced. Add a localized direct-file host disclosure.

Allowed paths after authorization: this ADR/index/relevant release note; exact candidate/release/catalog metadata; existing resolver/schema, detail static params, resource label and the strictly scoped native-video attribute; existing release policy and focused tests; small caption/poster files only. Full MP4 remains outside Git and Pages.

## Stop and review boundary

The owner expressly said to stop before an authorization or possible website impact. The current change therefore contains only proposed documentation and pending evidence. Runtime catalog, actual player code, articles/audio, website configuration and production deployment are unchanged.

Required next decision: authorize this single verified free-file integration and exact per-video player adaptation. Then validate the real integrated player, same-origin captions, pause/resume, seeking/fullscreen and mobile layout; obtain actual owner iPhone acceptance without reusing another release's test. Preserve authenticated exact-final-head GitHub acknowledgement, required checks/review and main-only deployment (ADR-0021); never fabricate approval or bypass protection. No production authorization is inferred from passing tests alone.

After deployment, verify production discovery/detail routes, original bytes, Range delivery and absence of YouTube requests on this page; update existing Obsidian metadata rather than creating duplicate content.

## Impact and rollback

No analytics or personal-data collection changes. Playing this exact item connects to disclosed GitHub/CDN instead of YouTube. Only public media is used; no credentials or expiring signed URLs are put in catalog data. Runtime uses the stable Release URL and follows platform-managed redirects. Roll back through a reviewed removal of the exact catalog reference, preserving immutable assets and all prior content. Small auxiliary files must remain within the existing media budget.

## References

- https://developers.cloudflare.com/pages/platform/limits/
- https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases

## Owner-authorized implementation checkpoint

After PR #106 merged as 7f89b62ff944985e6376e1cc80a417593c1a9231, the owner explicitly instructed completing this exact free-host/native-player integration. This authorizes implementing the minimal changes proposed above; it does not fabricate final-head GitHub acknowledgement or actual iPhone acceptance. Only this exact external MP4 tuple is excepted from the local-file registry budget rule; its small same-origin caption/SRT/poster files remain checked and counted. No global budget increase, new hosting service, charge or YouTube change. Main-only deployment and all blocking CI/review gates remain.

Production CSP: public/_headers adds media-src self, the one immutable GitHub file URL and its release-assets.githubusercontent.com redirect host. Existing script/connect/frame/object policies are preserved; no wildcard media permission is added. This is necessary for the production page, not a new player or hosting service.
