# ADR-0039 — The Day of No More Delay bounded audio release

Status: Accepted — owner approved ADR-0039 and preparation of the existing protected preview on 2026-10-26; media listening/iPhone acceptance passed; final review/release gates remain
Date: 2026-10-26
Owner: Paul Zhang
Scope: V1; no production administration activation
Classification: ARCHITECTURE CHANGE, bounded to this audio release
References: ADR-0032, ADR-0021; ADR-0033 is precedent only and its historical candidates remain unchanged

## Authorization and goal
The owner approved the local written specification `no-more-delay/sources/audio-release-spec.md` with “批准该规格，继续准备最小发布决定”. The owner subsequently reviewed PR #101 and explicitly replied “批准 ADR-0039，准备受保护预览”. This accepts the bounded decision and authorizes preparation of the existing protected preview. English listening and iPhone acceptance have subsequently passed as recorded below; final-head GitHub acknowledgement and production release remain separate gates.

Deliver only the Chinese and English local Voicebox MP3s for `sermon-revelation-10-5-7`, attached to the unchanged published article at `/library/the-day-of-no-more-delay` and `/en/library/the-day-of-no-more-delay`. Preserve the existing ArticleNarration → AiAudioPlayer and download controls. No video work, manuscript edits, new service, credentials, provider, paid calls, general audio-publishing permission or voice retraining.

## Accepted bounded decision
For these two candidates only, permit a reviewed GitHub release record to retain owner identity, provenance and separate listening/publication decisions instead of activating ADR-0032's unimplemented administration service. Do not broaden or reuse the old release exceptions. The canonical website MDX remains authoritative; reconcile the immutable vault narration input with the exact published source and presentation hashes. Non-preached editorial bookkeeping and factual editorial notes are not spoken; all sermon prose, testimonies, exposition, response and both prayers must remain covered.

Source publication commit: `12993a7467bd8cc998e9097d3dc8282fdfbf3a1d` (PR #100). Refresh exact source proof at review and publication; changed text makes approval stale.

| Locale | Candidate MP3 SHA-256 | Bytes | Status |
|---|---|---:|---|
| zh-CN | `396062c2bc5208c04703ab05f9733c19c25f522760308ccb86f8efbac3875dd2` | 21006476 | Owner full listening and iPhone acceptance passed |
| en-US | `d315feda24fe225a3bc780869e0981487f2c5fe4705212981b0ae8bbfa3c87e4` | 24731756 | v002 owner full listening and iPhone acceptance passed |

Chinese owner listening: “已完整试听，中文音频通过” for the exact MP3 SHA-256 above. This is a listening act only; English listening, protected preview/iPhone acceptance and final GitHub release acknowledgement remain pending. The immutable local approval record is retained as `qa/zh-owner-listening-approval.json`.

Chinese technical evidence: 45 preserved ordered segments; master duration 1750.445875 seconds; all segment/export hashes verified; full decoding passed; no silence exceeding two seconds at -45 dB; independent full-audio ASR similarity 92.88% with no long missing prose blocks detected. ASR differences and Scripture-number rendering remain listening questions. Automated checks are not human acceptance.

## Mandatory gates
1. Finish both exact candidates; validate full decoding, ordered input coverage, source/voice/audio hashes, durations, repetition, truncation and pause anomalies. Retain every original segment and WAV master. Failed/unknown requests require reconciliation; never regenerate approved segments blindly.
2. Obtain independent owner listening for each exact language asset. Record actor, time, narration input/configuration hash, source/presentation hash, MP3 hash and narration version; keep review and publication authorization distinct.
3. Keep candidate files local/private or on the existing Access-protected Pages preview. Verify anonymous protection for HTML and direct MP3 URLs before uploading. Do not expose unaccepted candidates through public Git/PR attachments or raw URLs. No new hosting or protection changes are authorized.
4. Test both locales on an actual iPhone: audible playback, pause/resume, seeking, download and playback of downloaded MP3. Record exact candidate hashes and actual owner result; do not invent device details or infer audibility from browser events.
5. After acceptance, add only exact immutable hash-named MP3 files, existing catalog bindings, release evidence and exact-asset performance checks in one focused PR. Obtain independent technical review, all required Quality gates and an owner-authored acknowledgement of the final full HEAD SHA. A new HEAD invalidates that acknowledgement. Do not self-approve or bypass protection.
6. Merge only under explicit release authorization. Deploy solely through the existing protected main workflow, then verify both live players, range delivery and byte-identical downloads. Keep existing MDX byte-identical and archive release links/integrity records in Paul AI Brain.

## Budgets and boundaries
Do not relax the generic 1 MiB public-file safeguard. Any exception must name only the two approved MP3 hashes and exact byte counts. Retain the standing 256 MiB cumulative public/media and 512 MiB local Git limits, provider file ceilings, existing rollback and security requirements. If either candidate exceeds the existing hosting/budget constraints, stop for a reviewed decision; do not recompress automatically, split delivery, delete old media or change infrastructure.

## Allowed paths and rollback
Decision preparation: this ADR, ADR index, release-boundary documentation and non-runtime evidence. Following acceptance: the two exact MP3s under public/media/narration, two entries in the existing published-narrations catalog, a release evidence record, exact-asset performance allowances and focused binding tests. No canonical MDX, player, analytics, privacy, route, workflow or unrelated file changes.

Rollback uses a reviewed revert of the two narration bindings; retain original WAV/MP3/segment files. There are no new analytics or private-data logging. This accepted bounded decision does not by itself constitute media acceptance or production release authorization.

English v002 technical evidence: 102 preserved ordered segments; full WAV/MP3 decode, segment/export hashes and duration reconciliation passed; master duration 2060.880125 seconds. Independent full-audio ASR similarity 98.08%; no long-difference flags or pauses of two seconds or longer. The original segment 20 omitted its final clause and showed repeated wording; only that unapproved segment was replaced. v002 reuses all other 101 segment files byte-for-byte, restores the complete final clause, and retains v001 and the original segment. Automated verification is not owner listening acceptance.

## Owner media acceptance — 2026-10-26
The owner explicitly replied “全部通过（含英文完整试听）” to the immutable 2ae07f37 preview and the full English/iPhone Safari playback, pause/resume, seeking, download and downloaded-file checklist. This accepts both exact candidate hashes above; device model/iOS/browser version were not provided and are not invented. Keep the final-head human GitHub acknowledgement, independent review, mandatory CI and normal main production verification as separate remaining gates.
