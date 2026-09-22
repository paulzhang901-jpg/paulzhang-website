# ADR-0028 — About Writing & Preaching Core Essays
Status: Accepted
Date: 2026-09-21

## Context
ADR-0025 fixes `writing-preaching` as permanent About section 04 and explicitly allows repository-verified content to grow inside that category without changing the seven permanent About identities. The owner has approved a second bilingual philosophy/vision essay whose conceptual home is About → Writing & Preaching, not a generic Library article.

The repository already provides one canonical MDX content system, bilingual translation identity through `canonical_id`, and public content validation. Creating a second prose store for About essays would duplicate canonical content.

## Decision
Core essays beneath About → Writing & Preaching use the existing canonical MDX content contract under the dedicated `about` content domain and are rendered through a nested bilingual About route:

- `/about/writing-preaching/[essaySlug]`
- `/en/about/writing-preaching/[essaySlug]`

The permanent seven-item About navigation remains unchanged. Section 04 may surface approved core essays as restrained related/core-reading cards. Each essay has one canonical body per locale in the repository content system, paired by one `canonical_id`; the About nested route is its public conceptual home.

Contextual links may point only to repository-verified live destinations. This decision creates no new taxonomy enums, no duplicate Library body, and no new global navigation item.

## Consequences
The nested About essay routes must preserve same-essay bilingual alternates, section-04 navigation context, existing typography/spacing, and the content validation contract. Adding or changing permanent About categories still requires architecture review under ADR-0025.
