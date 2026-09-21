# ADR-0024 — Community Permanent V1 Architecture
Status: Accepted
Date: 2026-09-20

## Context
`/community` is an approved V1 top-level domain, but it currently renders only the generic runtime foundation. Its earlier child-route reservation described future community functions rather than the permanent public information architecture now approved by the owner.

## Decision
`/community` is the canonical Community landing page. Community has exactly seven permanent bilingual navigation categories, in this order: `church`, `sunday`, `groups`, `choir`, `youth`, `care`, `join`. English mirrors the same semantic identities beneath `/en/community`.

The categories mean Church Introduction, Sunday Worship & Events, Groups & Fellowship, Choir & Serving, Youth & Next Generation, Community Care, and Join Us. First Chinese Free Methodist Church (FCFMC) may be identified by name, but factual ministry details require verified source content.

V1 provides a production landing page and usable category shells. Future work adds verified content and appropriate participation actions inside these stable categories rather than casually renaming, removing, or restructuring them. Community remains distinct from Together; any future Community form should reuse the approved secure submission architecture where appropriate rather than creating another email backend.

## Alternatives Considered
Keeping the placeholder, retaining the older function-oriented child slugs, or folding Community into Together were rejected because they do not represent the approved durable Community information architecture.

## Consequences
Route registries, bilingual static routing, SEO alternates, tests, and architecture documentation must preserve these seven identities and order. Changes to this permanent set require architecture review.

## Supersedes
The Community child-route list in ROUTE_SCHEMA.md and `routes.yaml` is replaced by this seven-category V1 contract.

## Superseded By
None.
