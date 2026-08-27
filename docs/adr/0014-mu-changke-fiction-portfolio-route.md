# ADR-0014 — Mu Changke Fiction Portfolio Route
Status: Accepted
Date: 2026-08-27
Human Approval: Approved 2026-08-27

## Context
Mu Changke Fiction needs one governed public discovery surface for the author's approved works. The surface must help readers identify a work and continue through its official reading channel without turning paulzhang.org into a fiction distribution or manuscript-reading platform. ADR-0002 requires an ADR before adding a top-level route.

## Decision
Add `/fiction` as the canonical `zh-CN` top-level route for **牧长客 · 小说世界 / Mu Changke Fiction** and `/fiction/[slug]` as its individual work-discovery route. ADR-0011 projects the same application logic beneath `/en/fiction` and `/en/fiction/[slug]`; `/zh` remains forbidden.

The domain is an **author portfolio, work discovery layer, and official reading router**. It is not a fiction distribution, chapter-reading, manuscript-hosting, download, or contract surface. Public records contain only human-approved LOCKED website editorial packages and explicitly verified cover mappings. The route must not publish manuscripts, chapters, draft or superseded versions, contract files or screenshots, internal rights analysis, or excluded/unpublished works.

Official reading calls to action may tell readers to search an approved platform using the canonical title and author name `牧长客`. They must not invent deep links, work IDs, publication facts, or availability claims.

The initial canonical portfolio contains exactly the twelve identities governed by the Mu Changke Fiction receiving contract. Adding or removing a public work requires an approved registry update and content-integrity review; it does not by itself change the route architecture.

## Alternatives Considered
- Placing the portfolio under `/stories` was rejected because authentic life stories and authored fiction have different truth, provenance, rights, and reader-expectation boundaries.
- Publishing chapters or full manuscripts on paulzhang.org was rejected because this product is a discovery/router layer and the approved rights boundary forbids distribution.
- Hardcoding twelve pages was rejected because canonical identity, editorial locks, exclusions, cover verification, and rights controls require one validated registry.

## Consequences
The V1 IA gains a bounded fiction portfolio without changing the Truth Library, Life Stories, or ContentWork reading contracts. Navigation may surface the portfolio only according to later approved product implementation. Search, sitemap, metadata, and structured data may consume approved public registry fields only. Manuscripts and contracts remain outside the application content namespace.

## Implementation Notes
Before page implementation, the repository must receive all twelve LOCKED editorial packages and twelve verified cover mappings. Schemas must reject unknown public fields, non-LOCKED status, prohibited routes, and superseded/excluded work identities. Missing optional approved fields remain null and are hidden. No `/fiction` application page is created by this architecture remediation.

## Supersedes
None. Extends ADR-0002 for the `/fiction` namespace.

## Superseded By
None.
