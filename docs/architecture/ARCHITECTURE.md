# Architecture Constitution v1

## Purpose and authority

This is the entry point for permanent product architecture governance. Authority order:

1. Accepted ADRs
2. Architecture specifications and documents
3. Website IA
4. Product requirements
5. Implementation documentation
6. Existing implementation

If code contradicts approved architecture, **the code is the defect**. Never rewrite governance merely to legitimize drift.

## Bounded domains and direction

Domains: content, taxonomy, search, stories, engagement, subscriptions, companionship, growth, identity, journey, community, GCCM, analytics, and AI.

Dependency direction: **Content → Discovery → Engagement → Relationship → Formation → Community → Mission.** Earlier domains should not require future domains.

## Invariants

1. Truth Library ≠ blog archive.
2. Growth Pathway ≠ course playlist.
3. Companionship ≠ automated chat.
4. Community ≠ social feed.
5. User State ≠ spiritual worth.
6. AI ≠ pastor or mentor replacement.
7. Subscription ≠ marketing funnel.
8. Analytics ≠ manipulation.
9. Paul Zhang ≠ product center.
10. Content → Relationship → Formation → Multiplication must remain possible.

## Change control

Changes to routes, canonical models/registries, privacy, AI, i18n, identity, Growth stages, release boundaries, or GCCM contracts require an ADR before implementation. Registries and schemas must change in the same review. Drift is detected by `npm`-free architecture tests and PR review; implementation routes may later be compared with `config/architecture/routes.yaml` when an application exists.

## Page contract standard

```yaml
route: /stories
domain: stories
release: v1
entry_states: [visitor, reader, returning_reader]
primary_user_need: [trust, identification, hope]
desired_transition: {from: reader, toward: returning_reader}
primary_cta: {type: companionship}
secondary_cta: {type: related_content}
analytics: [content.viewed]
```

## Architecture index

- Product: [North Star](../product/PRODUCT_NORTH_STAR.md), [IA](../product/WEBSITE_IA_V1.md), [Journey](../product/USER_JOURNEY.md), [Scope](../product/VERSION_SCOPE.md)
- Architecture: [Routes](./ROUTE_SCHEMA.md), [Content](./CONTENT_MODEL.md), [Taxonomy](./TAXONOMY.md), [User States](./USER_STATE_MACHINE.md), [Events](./EVENT_SCHEMA.md), [Privacy](./PRIVACY_MODEL.md), [AI](./AI_BOUNDARIES.md), [Internationalization](./INTERNATIONALIZATION.md), [Search](./SEARCH_ARCHITECTURE.md), [Releases](./RELEASE_BOUNDARIES.md)
- Decisions: [ADR index](../adr/README.md)
- Registries: [`config/architecture`](../../config/architecture/)
- Bootstrap evidence: [initial repository audit](./BOOTSTRAP_AUDIT.md)

The accepted public locale URL strategy is governed by [ADR-0011](../adr/0011-locale-url-strategy.md): unprefixed `zh-CN`, prefixed `/en` for `en-US`, and shared application logic.
