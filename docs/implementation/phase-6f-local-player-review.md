# Phase 6F — local bilingual narration player

Goal: reusable accessible MP3 playback before browser narration, without publication.
Owner: Paul Zhang. Scope: V1 presentation compatibility; production narration remains separately gated.
Allowed paths: the scoped player/content adapter, empty catalog, tests, package test wiring and this record.
Architecture reference: ADR-0030/0031 offline component boundary; ADR-0032 production authorization; ADR-0021 main-only deployment.
Classification: local-only implementation under the owner's Phase 6F authorization; no production AI, identity, privacy, route, content-model or release boundary is activated.
Version boundary: publication registry stays empty. No production media is copied into public/.
Analytics impact: none. Privacy impact: no new requests to third parties, keys, telemetry or cloud speech services.
ADR impact: protected publisher/source-proof integration must be reviewed before any populated production catalog or release.

## Behavior
One ArticleNarration slot chooses a current locale-specific published MP3 or the legacy reader. Explicit media-error fallback replaces the MP3 component. Shared ownership prevents overlap. MP3 supports pause/resume, seek, speed and download; play stays in the click handler. Unmount retains and pauses the actual mounted audio node even after React detaches its ref.

## Owner demonstration
On Mac Studio, open http://127.0.0.1:8766 while the private demonstration server is running. This is a component fixture, not a new sermon article or public preview.
The demo reads both approved original MP3 files through a loopback-only range server; no master is changed or copied to the website.
Try Chinese then English, pause/resume, seek and speed; starting either MP3 must stop the other. Start Browser fallback check, then an MP3, and reverse. Download links are language-specific.
The lifecycle fixture in tests/content/fixtures/narration-lifecycle-demo.mjs exercises actual mounted cleanup, including immediate unmount while play is pending. Its result must show PASS. Restore players afterward.
The separate browser fallback test sentence is test content only, not sermon content.

## Evidence and limits
22 focused narration/voice/mobile tests pass. Relevant broader regression run: 92/93 pass; tests/content/discovery.test.ts:56 expects 15 Little Wheat units but finds 16. The same assertion fails in an untouched HEAD snapshot; do not change unrelated content here.
Fresh static build, typecheck, scoped lint and static-export validation are recorded in the Mac Studio Phase 6F report. No actual iPhone claim is made.
Both canonical sermon MDX files and all original audio masters remain unchanged. No public narration entries, duplicate articles, production credentials, push, merge, deployment or security-setting changes.

## Remaining gates
Review the local implementation; separately resolve the pre-existing discovery test failure. Before protected preview/publication: approved ADR-0032 source binding and durable action-specific authorization, independent security review, protected preview/Access configuration and deployment permission, required main PR/check protection, real iPhone Safari playback/seek/speed/download, then explicit owner publication approval.
