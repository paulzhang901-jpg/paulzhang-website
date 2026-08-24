# ADR-0011 — Locale URL Strategy
Status: Accepted
Date: 2026-08-24

## Context
Chinese and English are first-class representations of canonical content, but ADR-0009 intentionally left public locale URL shape unresolved. Runtime routing, language switching, canonical URLs, and hreflang require one stable decision before implementation.

## Decision
The default locale is `zh-CN`; its URLs have no locale prefix (`/`, `/library`, `/stories`, `/grow`). The secondary locale is `en-US`; its URLs use `/en` (`/en`, `/en/library`, `/en/stories`, `/en/grow`). `/zh` and `/zh/...` must not be created.

Explicit user language choice outranks browser language. Browser language is a hint only and must not cause forced redirects. Route segments remain stable English technical identifiers; UI labels and editorial content are localized separately. Application templates and route logic are shared rather than duplicated by locale.

For canonical editorial content, `canonical_id` is cross-language identity and localized slugs may differ. If a translation exists, language switching resolves the same canonical content in the other locale. If absent, the UI presents a translation-unavailable state rather than treating the canonical counterpart as nonexistent or redirecting to a locale homepage.

Translated equivalents support canonical URLs and `hreflang` for `zh-CN` and `en-US`; they are not unrelated duplicate content.

## Alternatives Considered
`/zh` + `/en`, browser-forced redirects, locale negotiation without stable public prefixes, and separate locale applications were rejected.

## Consequences
Default-language links remain concise and English links are explicit. Locale-aware helpers must map shared route identifiers, preserve user choice, and support content translation resolution. Changing this URL strategy requires redirects and a superseding ADR.

## Implementation Notes
Runtime implementation belongs to `foundation/runtime-v1`; canonical editorial translation resolution belongs to the Content Foundation.

## Supersedes
The pending locale URL portion of ADR-0009; ADR-0009's canonical bilingual content decision remains Accepted.

## Superseded By
None.
