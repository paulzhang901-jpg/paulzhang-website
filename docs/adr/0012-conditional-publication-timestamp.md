# ADR-0012 — Conditional Publication Timestamp
Status: Accepted
Date: 2026-08-25

## Context
`published_at` represents the actual web-publication timestamp and is used by public discovery, search documents, presentation, and related-content ordering. Requiring it for draft and review content falsely represents unpublished material as already published.

## Decision
Keep the existing publication states. `published_at` is optional or null for `draft`, `review`, and `scheduled` content. It is a required valid offset ISO datetime for `published` and `archived` content. Public-content guards require both `status: published` and a valid normalized publication date, in addition to the existing public visibility and access requirements.

## Alternatives Considered
Fake or sentinel timestamps for unpublished content were rejected because they conflate workflow state with actual publication. Adding a new state or a separate publication workflow was rejected as unnecessary scope expansion.

## Consequences
Unpublished content can enter editorial validation without claiming a publication time. Published and archived records retain deterministic publication metadata. Search indexing, public sorting, and date presentation continue to operate only on published public content with a real timestamp.

## Implementation Notes
TypeScript and JSON schemas enforce the same conditional rule. Normalized unpublished items expose no `publishedAt` value. Existing public repository filters remain the boundary for discovery and indexing.

## Supersedes
None. Clarifies the publication lifecycle within ADR-0003.

## Superseded By
None.
