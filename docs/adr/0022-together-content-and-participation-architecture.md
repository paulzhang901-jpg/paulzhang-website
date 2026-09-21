# ADR-0022 — Together Content and Participation Architecture
Status: Accepted
Date: 2026-09-20

## Context
`/together` is a V1 companionship entry, but its approved child routes describe situational entry points rather than a durable publisher-facing content taxonomy. The owner has approved seven permanent bilingual Together sections and requires Markdown-driven publication plus safe visitor actions. The repository has no first-party secure form/submission backend; ADR-0010 also requires sensitive companionship and prayer data to remain separated with explicit privacy/retention controls.

## Decision
Together remains the canonical `/together` domain and gains seven permanent section identities, in order: `mentoring`, `prayer-support`, `growth-groups`, `faq`, `contact`, `testimonies`, `resources`. Chinese and English labels are locale projections of the same identities.

Canonical Markdown may live in the `together` content domain and assign exactly one registered `together_section`. Published content is discovered by the normal content repository; adding content to an existing section does not require page or taxonomy-code changes.

The landing and section pages use the established responsive left-navigation/right-content pattern. Empty permanent sections remain navigable.

V1 participation is a truthful human-handoff interface, not a data-collection form. Mentoring, prayer support, growth groups, contact, and testimony sections link visitors to the already-approved contact surface and identify Personal WeChat as the current delivery channel. No prayer text, testimony, counseling narrative, email address, or other sensitive submission is collected by this website until a separately approved backend defines provider, consent, access, retention, deletion, abuse controls, and operational ownership under ADR-0010. FAQ and resources remain publisher-managed content.

Previously approved Together child slugs remain as legacy route aliases so valid URLs do not break; they are not permanent section identities and are not displayed in the new seven-section navigation.

## Alternatives Considered
A client-only fake form, mailto submission, generic analytics storage, and a new third-party form provider were rejected. Reusing Truth Library, My Story, or Growth taxonomy was also rejected because Together is a distinct participation/content domain.

## Consequences
The content model adds an optional, Together-only `together_section` field and a `together` content domain. Route/schema documentation and static route generation must cover the seven permanent sections plus legacy aliases. A future secure submission backend requires a separate architecture/privacy decision before enabling form submission.

## Supersedes
The Companionship child-route list in ROUTE_SCHEMA.md is replaced by the seven permanent sections while preserving the former slugs as legacy aliases.

## Superseded By
None.
