# ADR-0020 — Canonical Content Metadata and Automatic Discovery Contract
Status: Proposed
Date: 2026-09-20

## Context
The owner approved Phase 2A only: architecture decisions, canonical metadata/schema contract, compatibility design, and validation contract. Product/UI implementation is deferred.

## Decision
### Ownership
- **Repository owns canonical content.**
- **Library organizes truth resources.**
- **Growth Pathway curates formation journeys.**
Library is not the technical owner of all website content. Public surfaces consume eligible canonical projections without duplicating canonical bodies.

### Ordinary metadata
- content_type describes form; primary_topic describes subject. Prefer content_type: article plus primary_topic: gospel for an evangelistic article.
- gospel-essay is not added in Phase 2A.
- growth_stages is optional for ordinary content: 0..N.
- life_domains is optional for ordinary content: 0..N.
- Grace Pathway-specific validation may require at least one growth stage only for explicitly designated pathway material.
- Do not invent life-domain values to satisfy validation.
- secondary_topics is optional 0..N and reuses registered fine-grained topics. relationships is not added.

Initial primary topics: bible, gospel, faith, spiritual-life, marriage-family, life-values, money-work, church-mission.
Initial life domains: faith, life, family, work, ministry, mission.
Growth stages: explore, believe, abide, serve, lead, multiply.

### Compatibility
No legacy reclassification or migration occurs in Phase 2A. Legacy topics remain valid. Registered legacy journey_stages may project to growth_stages when unambiguous. Missing growth_stages and life_domains remain valid. URLs, canonical IDs, bodies, translations, publication state, and rights state are preserved. Ambiguous mappings require later editorial decision.

### Protected models
Sermons, ContentWorks / ContentUnits, and Fiction references retain specialized authority and gates. Common catalog adapters may expose only a safe public projection after specialized eligibility is established; they cannot bypass approval, rights, hash, ordering, parent, LOCKED, official-reading, or publication gates.

### Writing, Light Journey, Grace Pathway
/writing is a future aggregation direction only. Phase 2A creates no route/UI and does not remove or repurpose /fiction.
Light Journey remains unresolved. No route, taxonomy, redirect, or rename of /gccm or /journey is created.
Grace Pathway V1 is six stage explanations plus automatically queried eligible public resources. Ordered pathways are V1.5. Progress, identity, mentoring, and community workflows remain later scope.

### Long-term acceptance rule
For ordinary content using registered types/taxonomy, future publication must require only a content file, valid metadata, and optional approved media. It must not require per-item changes to src/, navigation, route components, collection configuration, sitemap code, or search code. Those systems must discover eligible content automatically.

## Validation Contract
schema/content-frontmatter-v2.schema.json is the serialization contract. Phase 2A does not activate v2 runtime parsing. Phase 2B must either derive runtime validation from the canonical schema/registry or enforce deterministic Zod/JSON-Schema parity in CI. General validation accepts absent/empty growth_stages and life_domains. A future Grace Pathway validator may add growth_stages >= 1 only for explicitly designated pathway material. Protected adapters validate specialized gates first. Listing, detail, search, related content, and sitemap must converge on the same public eligibility projection.

## Alternatives Considered
Rejected: Library as technical owner of all content; mandatory growth/life classification; relationships now; gospel-essay now; legacy reclassification in Phase 2A.

## Consequences
This phase establishes governance/schema only. No route, navigation, component, sitemap, search UI, content migration, publication, or deployment is authorized.

## Supersedes
None. Extends ADR-0003, ADR-0004, ADR-0013, ADR-0014, ADR-0017, ADR-0018, and ADR-0019 without weakening specialized gates.

## Superseded By
None.
