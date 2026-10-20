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

## Owner acceptance update — seeking-only investigation

Owner reports playback, pause/resume, full-screen, subtitles and video display PASS; seeking/scrubbing from about 1:00 to 3:00 FAIL. This is partial acceptance, not a full publication acceptance. No device/iOS details were supplied. Production eligibility remains false.

Read-only checks completed: both originals have ftyp then moov at byte 32, before mdat (Chinese mdat offset 398283, English 496467); faststart already exists. Keyframes occur about every 10.416667 seconds, including around both test positions. FFmpeg input-side seeks decode video/audio successfully at 60 and 180 seconds for both originals. Player uses native controls/playsInline, no custom seeking interception. No remux or re-encoding is justified by this evidence.

A read-only control against an existing published video returns actual HTTP 206 for GET Range bytes=0-1, Content-Length 2 and Content-Range bytes 0-1/12744840. Therefore a generic claim that Pages cannot serve ranges is not justified. Candidate preview requests without authentication reach Cloudflare Access, so their login-response headers cannot establish the MP4 Content-Length, Accept-Ranges or Range behavior.

Authenticated diagnosis completed after owner Access login. A protected diagnostic-only export was deployed at https://d6027be7.paulzhang-website-preview.pages.dev (same existing project/branch; media/player unchanged). Its /seek-diagnostics page issues two same-origin GET ranges per candidate, renders only response status/headers, cancels the response body and never reads/exports credentials. Both bytes=0-1 and bytes=4000000-4001023 return full-file HTTP 200 for BOTH MP4s. Chinese Content-Length 15331438; English 19963562; video/mp4; no Content-Range, Accept-Ranges or Content-Encoding observed. This establishes ignored byte ranges in this protected preview delivery path; it does not establish which internal Cloudflare layer is responsible.

Both authenticated native players report seekable [[0,0]] despite buffered media. Timeline clicks near one and three minutes fail: Chinese stays at 47.638741 seconds; English continues normal playback around 14 seconds. Therefore the requested 60→180 transition remains FAILED, not verified fixed. Original approved bytes, Access configuration and player remain unchanged. Faststart/remux or adding a misleading Accept-Ranges header would not implement actual partial delivery.

ARCHITECTURE CONFLICT
Requested behavior: reliable seeking in the protected bilingual video preview.
Conflicting architecture: the observed static preview delivery ignores Range; adding a runtime Range-serving handler or changing hosting is outside the accepted static delivery boundary.
Relevant file / ADR: docs/adr/0037-repeatable-approved-video-releases.md, Decision proposed before activation.
Impact: preview acceptance remains failed; no production eligibility; no media regeneration or security weakening permitted.
Recommended resolutions:
A. Implement within current architecture if a supported existing Pages configuration can be demonstrated to return genuine partial responses without Access changes.
B. Amend architecture through a reviewed ADR for a narrowly scoped authenticated Range-serving delivery mechanism.
C. Defer to future release.

No supported configuration remedy has been verified. Stop for the architecture decision rather than introduce a service or assert a fix. The existing PR remains Draft, with no new PR, merge or production deployment.
