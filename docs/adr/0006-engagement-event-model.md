# ADR-0006 — Engagement Event Model
Status: Accepted
Date: 2026-08-24

## Context
Engagement and encouragement can drift if page-local tracking proliferates.
## Decision
Use a centralized, registered event model and centrally governed encouragement eligibility; do not scatter timers or event names across pages.
## Alternatives Considered
Independent page timers and provider-specific event names were rejected.
## Consequences
Only registered, needed events may be emitted; active reading is not tab-open time.
## Implementation Notes
Raw sensitive text is forbidden in analytics properties.
## Supersedes
None.
## Superseded By
None.
