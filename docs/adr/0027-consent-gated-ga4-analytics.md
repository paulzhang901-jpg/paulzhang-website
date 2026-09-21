# ADR-0027 — Consent-Gated Google Analytics 4
Status: Accepted
Date: 2026-09-21

## Context
The owner selected Google Analytics 4 (GA4) for anonymous production website analytics with measurement ID `G-YC5TTPM9GE`. ADR-0010 requires analytics consent to be explicit and scoped, and ADR-0006 prohibits raw sensitive text and page-local tracking proliferation. The site also uses Cloudflare Web Analytics independently and must not replace or interfere with it.

## Decision
Use one global, consent-gated GA4 integration in the shared locale root layout. GA4 scripts and network requests MUST NOT load before the visitor explicitly grants analytics consent. The consent decision is stored only in first-party browser storage under a versioned analytics-specific key and may be changed later from the same global control.

The V1 integration sends GA4's standard page measurement only. Application code MUST NOT send prayer text, form values, search text, grief/marriage/counseling disclosures, private reflections, contact identity, or other raw sensitive content as analytics properties or custom events.

The Google tag is implemented through Next.js `next/script` after consent rather than duplicated across routes. The measurement ID is a public configuration identifier, not a secret. Cloudflare Web Analytics remains independent and unchanged.

## Alternatives Considered
Loading GA4 unconditionally was rejected because it conflicts with ADR-0010. Page-local tags were rejected because they duplicate tracking and conflict with ADR-0006. Replacing Cloudflare Web Analytics was outside scope and rejected.

## Consequences
The shared layout gains a minimal client-side analytics-consent control. Visitors who decline are not tracked by GA4. Visitors who accept load GA4 globally across Chinese and English public routes. CSP must allow only the Google script and collection origins required by GA4. Future custom GA4 events require separate review against the canonical event registry and privacy model.

## Supersedes
None.

## Superseded By
None.
