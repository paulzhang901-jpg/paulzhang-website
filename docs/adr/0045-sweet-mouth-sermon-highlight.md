# ADR-0045 — Exact Sweet in the Mouth sermon highlight delivery

Status: Accepted
Date: 2026-11-01
Owner: Paul Zhang
Classification: ARCHITECTURE EXTENSION — exact media delivery binding, V1

## Authorization and scope

The owner's direct “Paul AI Video Studio — 视频正式发布” instruction identifies the already delivered November 1, 2026 Chinese highlight (277.791667 seconds, 1920×1080), authorizes its unchanged publication below `/library/sweet-in-the-mouth-bitter-in-the-stomach`, supplies the exact heading and description, and explicitly authorizes necessary Git commits and deployment. Reuse the existing native player and free hosting; no YouTube, paid service, recompression, manuscript edits or other-sermon changes.

This is permission for this exact artifact and normal protected publication, not an assertion of a GitHub human review, physical iPhone test or an authorization for future media. For this artifact only, the direct owner instruction supplies content/production authorization; independent technical review, blocking CI and normal protected main merge/deployment remain required. Do not fabricate old per-release iPhone/preview or exact-head GitHub acknowledgement records. This narrowly replaces those additional confirmation steps for this owner-directed release; other releases retain their existing gates.

## Exact decision

Reuse ADR-0043's GitHub Release/native-video delivery method for only canonical article `sermon-revelation-10-8-11`, locale `zh-CN`, original MP4 SHA-256 `4cacb571f183ba4d63f27834a3f4cd75bec5d1bb50315d25e7a6e9720b6cbe8a`, 21,441,999 bytes. Use the immutable URL recorded in `config/media-publishing/sweet-mouth-highlight-release.json`. The repository's cumulative 256 MiB media ceiling cannot accommodate this file; do not increase it or remove existing assets. Only the small hash-named poster and subtitles enter Git/Pages.

The existing article-linked catalog binds the unchanged canonical sermon presentation hash. For this exact Chinese highlight only, no English video or separately published full-sermon narration is invented. Exact source file/commit, original media identity and auxiliary bytes are checked by the release policy. Other article-video releases retain ADR-0037's bilingual/narration requirements.

Reuse VideosSection; allow optional section heading/description and full-width layout for this article embedding. Omit crossorigin only for the exact canonical ID, locale and immutable MP4 tuple, matching the established GitHub CDN constraint. Add only that precise GitHub file URL to existing media-src; the CDN host is already admitted. No generic no-CORS option, iframe, proxy, service, dependency, route family, taxonomy, analytics or content-model change.

## Acceptance and rollback

Preserve both sermon source files byte-for-byte and all prior media records. Test wrong identity/URL/source/assets fail closed, the Chinese section appears after the manuscript, the English article is unchanged, and existing players retain their attributes. Check desktop/mobile-sized playback, pause, resume, seeking, captions and no YouTube requests; label emulation separately from actual iPhone hardware evidence. After normal main deployment verify the exact production page and source-video download hash/resolution. Roll back by a scoped reviewed removal of this reference, retaining originals.

Allowed paths: this ADR/index, exact release/catalog and auxiliary assets, existing content presentation/player's optional parameters, exact CORS guard, CSP media-src, release policy and focused tests. The MP4 stays outside Git. Do not deploy until upload and anonymous delivery integrity checks succeed.
