# ADR-0029 — Temporary Isolated iPhone Audio Diagnostics
Status: Proposed
Date: 2026-10-10

## Context
The owner verified audible video and native iOS speech, but both iOS Chrome and Safari remain silent on the production Read Aloud player. A standalone comparison is needed before altering that player.

## Decision
Propose a temporary, unlinked, unindexed diagnostic utility at /internal/audio-diagnostics (unprefixed utility, not a new bilingual content section). It tests browser-default English and Chinese SpeechSynthesis independently of the production player, and a same-origin HTML5 audio sample. Events and manual audibility answers remain in the browser only. No server telemetry, microphone, recording, analytics event, or external speech API. Noindex metadata and robots disallow are defense-in-depth, not access control.

## Alternatives Considered
Continue speculative player changes (rejected); embed diagnostics in the player (rejected); manual-only device troubleshooting (insufficient isolation).

## Consequences
A publicly accessible but unlinked route is introduced pending owner review of this ADR and PR. It is excluded from navigation, search and sitemap. Remove route, sample audio and route registration in a later dedicated PR after diagnosis. The production player and locale route strategy remain untouched.

## Implementation Notes
This PR contains the proposed architecture decision and corresponding implementation together for review; do not merge until the ADR is accepted.

## Supersedes
None.

## Superseded By
None.
