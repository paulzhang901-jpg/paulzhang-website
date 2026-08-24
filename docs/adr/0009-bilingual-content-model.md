# ADR-0009 — Bilingual Content Model
Status: Accepted
Date: 2026-08-24

## Context
Chinese and English must remain connected while retaining independent editorial status.
## Decision
Model Chinese and English as locale representations of canonical content, not disconnected duplicates. Track translation status independently.
## Alternatives Considered
Separate unrelated pages and automatic equality of publication status were rejected.
## Consequences
Canonical IDs connect locales. Locale URL strategy remains explicitly pending.
## Implementation Notes
A later ADR must decide `/zh`/`/en` versus negotiated/default locale routing.
## Supersedes
None.
## Superseded By
None.
