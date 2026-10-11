# ADR-0030 — Controlled Bilingual AI Audio and Video Publishing
Status: Proposed
Date: 2026-10-11

## Context
The browser SpeechSynthesis player is not audible on the owner's iPhone; isolated HTML5 WAV also reportedly failed. No device event logs establish a root cause. Articles have canonical bilingual MDX sources; production is a Next.js static export deployed through Cloudflare Pages. AI narration must never be presumed to fix device audio until tested on hardware.

## Decision
Implement **offline, opt-in media publishing infrastructure only**. The approved published MDX source is immutable. Extract narrative text deterministically with paragraph order and punctuation retained; fail closed on unsupported MDX constructs. Content SHA-256 and a separately hashed voice configuration (provider, model, voice, language, format, speed/instructions) identify one cached MP3 per version. A validated manifest links canonical ID, locale, source hash, config, audio, subtitles, video, status, timestamp and estimated cost. Generation uses a pluggable provider interface; the mock produces clearly labeled synthetic audio without network access. OpenAI production generation requires a separately authorized operation, an explicitly selected currently supported model and environment-only credentials; this phase provides no paid invocation.

The reusable client HTML5 player is **not mounted on article pages** and never calls speechSynthesis or TTS APIs. Subtitles require measured alignment to the actual narration: validate SRT/WebVTT ordering and duration, but do not fabricate timestamps. FFmpeg consumes the **same validated MP3**, an approved background and aligned subtitles, producing 1920×1080/30fps H.264/AAC MP4 with title, author and closing website identification. Rendering is offline and explicit, never triggered by page visits, builds or publication. No copyrighted media without rights clearance.

## Alternatives Considered
Browser speech synthesis (fails on target iPhone); real-time paid generation (cost, latency and credential risk); separate audio for video (wasteful and prone to drift); automatic character-count subtitle timing (inaccurate); storing large MP4 files in Git (rejected).

## Consequences
Media storage and delivery URLs remain configurable; no new paid storage or production Cloudflare changes are authorized. Large video artifacts stay outside Git. Human review gates audio, alignment, video and publication. Browser audio compatibility remains unverified until Paul hears it on an actual iPhone. AI narration must be disclosed as AI-generated; it is not Paul Zhang's recorded voice. No article text, canonical IDs, routes, SEO or translation changes. Architecture extension is confined to independent tooling and an unmounted player.

## Implementation Notes
This PR provides the ADR, mock pipeline, manifest/cache validation, subtitle validation, FFmpeg command preparation and standalone player. A real TTS adapter, verified forced aligner, approved storage, generated production audio/video and page integration require later explicit authorization. The generation command refuses any non-mock provider, even if an API key is present. No secrets in logs/manifests. Roll back by reverting this isolated PR; existing article pages remain untouched. Production media publication must use a separate reviewed change.

## Supersedes
None.

## Superseded By
None.
