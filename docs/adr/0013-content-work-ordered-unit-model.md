# ADR-0013 — Content Work and Ordered Unit Model
Status: Accepted
Date: 2026-08-25

## Context
The unified ContentItem model represents independent editorial items well, but it cannot express one canonical work containing multiple ordered, independently translated units. Treating chapters as unrelated posts would lose work identity, stable sequence, bilingual linkage, and work-level publication boundaries.

## Decision
Add an additive Content Work model beside ContentItem.

A Content Work has a stable schema-compliant canonical identity, a registered `work_type`, localized representations, the existing publication lifecycle, and an explicit ordered list of canonical unit identities. `story_book` is the first approved work type, not the only possible future type.

A Content Unit has its own stable canonical identity, exactly one parent work identity, a registered `unit_type`, an explicit positive order, a localized slug and title, an optional chapter number, localized body content, and the existing publication lifecycle. Every localized representation of one canonical unit keeps the same parent and order.

Work membership and order are authoritative data. Filenames do not determine sequence. Missing units, duplicate membership, duplicate order, parent mismatches, and work/unit cycles are invalid.

Public work and unit resolution preserves the existing boundary: `published`, `public` visibility, `public` access, and a valid `published_at`. A public unit additionally requires a public parent-work representation in the same locale. ADR-0012 governs timestamps.

Chinese routes remain unprefixed and English routes remain under `/en`. Work landing routes use `/stories/[work-slug]`; units use `/stories/[work-slug]/[unit-slug]`. Localized slugs may differ while canonical work and unit identities remain shared. Missing translations are explicit and never fabricated.

## Alternatives Considered
Encoding `story_book` as an ordinary ContentItem subtype, inferring order from filenames, treating chapters as unrelated stories, and hardcoding one flagship work were rejected.

## Consequences
The platform gains a reusable multi-unit publication primitive without migrating existing articles, sermons, stories, or other ContentItems. New work types and unit types require deliberate registry additions. Work presentation and routing can be reused by books, structured series, and other approved multi-unit formats.

## Implementation Notes
Work manifests and localized unit records live under `content/works` when product content is later authorized. This architecture PR supplies schemas, repository validation, route templates, static-parameter generation, sitemap support, and test fixtures only; it does not materialize a public work.

## Supersedes
None. Extends ADR-0003 for multi-unit canonical works.

## Superseded By
None.
