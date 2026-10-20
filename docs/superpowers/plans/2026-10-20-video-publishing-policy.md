# Governed video release proposal plan

Goal: propose reusable V1 video delivery without per-video architecture exceptions.
Architecture: existing static export/player/canonical catalogs; empty non-runtime release registry; fail-closed activation and exact media budget validation. ADR remains Proposed pending owner review.
Spec: docs/adr/0037-repeatable-approved-video-releases.md
Execution: direct implementation of the explicitly requested proposal and policy/test updates; no publication implementation before approved merge.

- [x] Isolate from verified main; preserve original dirty checkout.
- [x] Write proposed decision and impact/workflow/limits before validator changes.
- [x] Add behavioral tests before helper implementation, including activation, tampering, traversal, stale sources and missing acceptance.
- [x] Add helper and wire existing performance gate, retaining legacy exceptions and empty registry.
- [ ] Run local relevant checks, inspect diff, create focused architecture PR; wait for required GitHub reviews/checks.
- [ ] After architecture acceptance/merge only, resume separate publication work; retain iPhone and production gates.

No media generation, media changes, uploads, runtime catalog edits or production deploys are included. Registry evidence is untrusted metadata; authenticated owner review remains external. Existing dependencies only. Repository-media and historical Git-size ceilings are distinct.
