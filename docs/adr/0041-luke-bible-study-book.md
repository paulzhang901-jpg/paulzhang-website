# ADR-0041 — Luke Bible Study Book
Status: Accepted — explicit owner approval in Phase 6 conversation
Date: 2026-10-28

## Context
The owner explicitly authorized public release of the approved Chinese Luke book and preservation in the existing Obsidian vault. ADR-0013 supplies ordered works, but only story_book is registered. A Bible study should not be misclassified as a story book or split into unrelated ContentItems.

## Decision
Register bible_study_book as an additional work type. Reuse the existing ContentWork and ContentUnit schemas, ordering, locale rules, /stories/[work-slug] and /stories/[work-slug]/[unit-slug] routes, server-rendered reading components, sitemap and main-only Cloudflare workflow. Use one resource entry in the existing Truth Library as the discovery and download entrance, referring to the canonical work rather than duplicating the book body.

Scope is the single approved Luke Chinese edition. Its English title is metadata only. Download files retain their approved bytes and original review/proof labels; a release note records the subsequent author approval. Add no English body, new top-level route, analytics, identity, privacy or deployment mechanism. Preserve all other works.

Only this work receives a publication introduction/download section in its existing work page. Generic behavior for other works remains unchanged. Units are deterministic projections from the approved full Markdown master with section hashes; the vault uses the same master and download hashes. Future revisions start at the master and repeat synchronization.

## Impact and validation
V1 content publication; additive taxonomy value. Existing schema accepts registered work identifiers. Existing architecture, content, translation, security, typecheck, lint, application build and static-export gates apply. Verify 80 unit bodies, every contents link, downloads, mobile layout, production deploy and vault hashes.

## Review
The owner explicitly approved adding bible_study_book and continuing publication in the Phase 6 architecture-review reply on 2026-10-28. This approval precedes implementation.
