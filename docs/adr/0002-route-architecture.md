# ADR-0002 — Route Architecture
Status: Accepted
Date: 2026-08-24

## Context
Stable semantic namespaces prevent navigation and taxonomy drift.
## Decision
Reserve namespaces in `ROUTE_SCHEMA.md`/`routes.yaml`; keep labels independent of paths; never derive content classification from folders; require redirects/version review for semantic changes.
## Alternatives Considered
Ad hoc page routes and taxonomy-from-folders were rejected.
## Consequences
New top-level routes require an ADR. Locale URL shape remains pending and is not decided here.
## Implementation Notes
Architecture tests validate the registry; application route comparison begins when routes exist.
## Supersedes
None.
## Superseded By
None.
