# ADR-0026 — Light Journey Permanent V1 Architecture
Status: Accepted
Date: 2026-09-20

## Context
`/journey` was reserved for a future private/personal journey application surface. The site owner has now explicitly assigned that public namespace to “光旅 / Light Journey,” a bilingual editorial top-level channel. This changes the route's meaning and release boundary and therefore requires an architecture decision before implementation.

## Decision
`/journey` is the canonical public V1 Light Journey landing page and `/en/journey` its English projection. It is the eighth primary navigation channel.

Light Journey has exactly seven permanent categories, in order: `travel`, `reflections`, `culture`, `faith`, `society`, `stories`, `churches`. Chinese and English share these stable semantic IDs and mirror routes beneath `/en`.

This task establishes only landing/category architecture. It creates no articles, travel claims, photographs, church-visit claims, or private journey state. Future public editorial content may be assigned inside these categories without restructuring the routes.

The previous reserved `/journey/{reading,saved,growth,reflections,rule-of-life,prayer,community,mentor,next-step}` application-route concept is superseded. Private saved content, growth profiles, reflections, and related authenticated product features remain V1.5+ capabilities but no longer own the public `/journey` namespace; any future routes for those capabilities require a separate architecture decision.

## Consequences
Canonical routing, bilingual metadata, static export, architecture validation, and primary navigation must preserve the seven category identities and order. Existing Community, Together, About, Growth, Library, and My Story architecture remains unchanged.

## Superseded By
None.
