# ADR-0025 — About Permanent V1 Architecture
Status: Accepted
Date: 2026-09-20

## Context
`/about` is an approved V1 top-level domain but still renders the generic runtime foundation. Its existing `/about/contact` and `/about/support` pages are already canonical, approved bilingual surfaces with substantive contact, QR, support, and payment content that must not be duplicated or replaced.

## Decision
`/about` is the canonical About landing page. About has exactly seven permanent bilingual navigation categories, in order: `profile`, `calling`, `education-ministry`, `writing-preaching`, `publishing-media`, `contact`, `support`. English mirrors the same semantic identities beneath `/en/about`.

The existing Contact and Support routes remain canonical as sections 06 and 07. Their approved components and data remain the source of substantive content and functionality; About supplies only the shared section navigation around them. Sections 01–05 begin as restrained structural shells and may gain repository-verified content later without changing the permanent route architecture.

## Alternatives Considered
Creating duplicate Contact or Support pages, moving their routes, or retaining the older fragmented About child-route list were rejected because they would split canonical content or create navigation drift.

## Consequences
Route registries, bilingual static routing, SEO alternates, tests, and architecture documentation must preserve these seven identities and order. Future About work belongs inside these categories; renaming, removal, or restructuring requires architecture review.

## Supersedes
The previous About child-route list in ROUTE_SCHEMA.md and `routes.yaml` is replaced by this seven-category V1 contract.

## Superseded By
None.
