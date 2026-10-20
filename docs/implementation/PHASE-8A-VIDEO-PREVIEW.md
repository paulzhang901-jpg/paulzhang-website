# Knowledge and Wisdom — protected candidate preview

Status: PREVIEW READY / OWNER IPHONE ACCEPTANCE PENDING / NOT PRODUCTION.
Architecture: ADR-0037 accepted and merged through PR #90; source base b43ca0bd7d0460be6a00aabb1b20c95e2b77bd1f.
Publication branch: feature/knowledge-wisdom-videos. This Draft PR contains only candidate metadata and this report; no unaccepted media or active runtime catalog bindings are pushed to the public repository.

## Exact preview

Chinese: https://a6d13212.paulzhang-website-preview.pages.dev/videos/knowledge-and-wisdom
English: https://a6d13212.paulzhang-website-preview.pages.dev/en/videos/knowledge-and-wisdom
Branch alias: https://knowledge-wisdom-phase8a.paulzhang-website-preview.pages.dev
Pages project: paulzhang-website-preview; non-production branch knowledge-wisdom-phase8a. Access settings unchanged. The isolated candidate export is visibly marked NOT PRODUCTION and noindex; analytics is omitted. Fixture catalog event/date are explicitly preview-only and are absent from normal production catalogs.

## Checks completed without regenerating media

- Existing approved MP4/SRT bytes matched their recorded hashes before copying. Original audio, videos, subtitles, slides and Mac Studio project preserved.
- WebVTT derived by timestamp-format conversion only, without changing subtitle wording/timing; existing first-slide PNGs reused as posters.
- Existing app build PASS; static export PASS 334/334 routes, zero broken internal links.
- Both locale HTML pages bind exact MP4/SRT/VTT/poster URLs, existing published canonical articles and existing published narration URLs; native controls and playsInline retained.
- Exactly two candidate video catalog projections; existing entries retained. Normal production catalog unchanged.
- Before and after upload: both locale HTML routes and all direct MP4/SRT/VTT/poster paths redirect anonymous requests to Cloudflare Access login (302). No public media exposure or security relaxation.
- Authenticated playback, seeking, full-screen, subtitle visibility and actual iPhone Safari acceptance are PENDING owner testing; successful upload/static checks are not listening/playback acceptance.

## Required owner acceptance

Log in to Access and test both URLs on iPhone Safari: audible playback, pause/resume, seeking, full-screen, visible captions, SRT downloads, article/audio links and existing videos. Report explicit PASS/FAIL for both languages and device/iOS when available. Do not treat the owner's earlier production authorization as an assertion that these tests occurred.

After acceptance, retain exact tested hashes, update the governed ACTIVE registry and runtime catalog, stage the same approved assets in this existing PR, run final-head checks and required review/owner acknowledgement. Do not merge this preparation-only Draft PR or deploy candidate fixture output to production. Production remains blocked until ADR-0037 per-release gates pass.
