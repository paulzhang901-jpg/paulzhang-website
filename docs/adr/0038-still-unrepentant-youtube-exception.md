# ADR-0038 — Still Unrepentant: exact YouTube embed exception

Status: Proposed — decision review required; no runtime activation or production authorization.
Date: 2026-10-20
Owner: Paul Zhang
Classification: ARCHITECTURE CHANGE
Scope: V1, one existing Chinese sermon video only.

## Goal and evidence

Reuse the existing Videos listing/detail layout to connect readers to the published canonical sermon and its existing approved YouTube upload. This helps readers move from teaching to the related written resource without creating a second content body.

Exact watch URL: https://www.youtube.com/watch?v=0J44f6acTeQ
Video ID: 0J44f6acTeQ
Title: 《仍旧不悔改》; English reference: Still Unrepentant.
Channel: Paul Zhang, @PaulZhang-j2w, UCij02113c9lnl5oZeRKbE6Q.
The public channel description identifies Pastor 张崇助 / Paul Zhang and links fcfmchurch.org. The channel contains both Knowledge and Wisdom videos. The watch page displays 25:56; playback advanced to 0:06 and pause succeeded on 2026-10-20.
The association with the supplied owner email has NOT been authenticated: the browser is signed into a different account. Owner must confirm this exact video/channel binding before activation.
No iframe playback test or protected website preview has yet occurred.

## Architecture conflict and proposed resolution

Requested behavior: embed the existing owner YouTube video through the official iframe player.
Conflicting architecture: ADR-0034 explicitly excludes YouTube iframe/privacy dependencies; ADR-0037 authorizes only independent bilingual MP4/SRT/VTT/poster releases. Catalog validation rejects YouTube media URLs.
Relevant ADRs: 0034, 0037, 0021.
Impact: one third-party embed and a bounded privacy/release exception; existing MP4 releases remain unchanged.
Resolution proposed: accept this exact-video exception; retain all other current rules. Do not put a YouTube URL into the MP4 field or disable general validation.

## Proposed decision

1. Authorize only zh-CN video 0J44f6acTeQ from the exact channel above, subject to owner identity confirmation and protected-preview acceptance. No English video is implied.
2. Reuse existing VideosSection/detail components and canonical sermon metadata. Resolve existing canonical identity before implementation. No invented sermon date, description, Scripture, subtitles or audio provenance.
3. Render an explicitly typed, fail-closed YouTube presentation variant for this one approved binding. Keep all existing MP4 variants and their captions unchanged.
4. Use an official HTTPS privacy-enhanced YouTube iframe, fixed video ID, descriptive accessible title, responsive existing aspect ratio, keyboard/fullscreen support and no autoplay. Do not load the iframe or third-party thumbnails before an explicit user activation with a short third-party disclosure. Use existing local approved poster where applicable; no media generation.
5. Provide a watch-on-YouTube fallback. Do not claim a local MP4 download or caption file exists. No fabricated subtitle track. Preserve other accessibility requirements and show actual subtitle availability truthfully.
6. Limit any required frame policy change to the exact official embed origin and document affected static-export headers. No wildcard CSP, new trackers, analytics events, credentials, runtime backend or unrelated security changes. Review YouTube privacy implications; privacy-enhanced mode does not mean zero third-party data sharing.
7. No local MP4 upload, R2 setup, paid service, transcoding or generated media. The previous unaccepted larger-file storage proposal is superseded and must not be activated.
8. Preserve protected preview Access requirements; check anonymous denial for candidate HTML before upload. The owner has already made the YouTube video public; a protected website preview cannot make that public YouTube object private and must not claim otherwise.
9. Preserve independent technical/security review, required CI and aggregate validate, owner preview acceptance, human-authored exact-head GitHub acknowledgement and separate final production authorization. No self-approval, admin merge, protection bypass or feature-branch production deployment.
10. Production remains normal main CI under ADR-0021. Rollback is a normal reviewed revert of the one binding/variant, or authorized immutable website deployment rollback. Do not delete or alter the YouTube upload or original masters.

## Delivery contract

Allowed implementation paths after acceptance: existing video catalog/schema/resolver and VideosSection/detail components; narrowly scoped embed privacy/header handling; existing governance validator; targeted tests; architecture references and this ADR. No new top-level route, content body, navigation redesign or canonical-model replacement.

Version boundary: one V1 Chinese video. Any broader provider support or additional binding requires reviewed authorization.
Analytics: no new analytics; external YouTube interaction occurs only after visitor activation.
Privacy: explicitly disclosed third-party request after activation; preserve all other controls.
ADR impact: supersedes only the stated no-YouTube and bilingual/direct-media requirements for this exact record, after accepted review. Existing ADR-0037 records and media budgets remain intact.

Acceptance/tests: wrong video/channel and arbitrary embed origins rejected; existing MP4 records unchanged; no iframe before activation; accessible keyboard activation/fullscreen/fallback; no invented subtitles/download; existing required architecture/application/content/security checks, aggregate validate and build/static export; protected-preview playback/pause and owner acceptance. No repeat media decode or seeking investigation.

## Owner review needed

Confirm: “0J44f6acTeQ on @PaulZhang-j2w is my approved 《仍旧不悔改》 video. I approve this narrowly scoped YouTube policy exception and its disclosed third-party privacy behavior for implementation and protected preview. Production still requires final preview acceptance and release approvals.”

This proposed decision does not record that confirmation as already obtained.
