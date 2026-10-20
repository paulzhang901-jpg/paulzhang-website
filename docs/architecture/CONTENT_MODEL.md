# Unified Content Model

Decision: **one canonical content object, many contexts** ([ADR-0003](../adr/0003-unified-content-model.md)). Library, home, stories collections, search, growth paths, AI, community, and GCCM reference canonical entities rather than duplicating them.

```yaml
ContentItem:
  id: stable identifier
  slug: canonical slug
  status: draft | review | scheduled | published | archived
  title: localized text
  subtitle: localized text
  summary: localized text
  body: localized body
  content_type: taxonomy reference
  primary_language: locale
  translations: locale representations
  authors: references
  published_at: web-publication timestamp; optional/null before publication; required for published/archived content
  updated_at: timestamp
  topics: taxonomy references
  life_needs: taxonomy references
  journey_stages: taxonomy references
  audiences: taxonomy references
  scripture_refs: structured references
  series: references
  collections: references
  featured_image: media reference
  media: media references
  reading_time: optional estimate
  difficulty: optional editorial descriptor
  formation_intent: explicit intent
  reflection_prompts: optional
  practices: optional
  discussion_questions: optional
  prayer_prompt: optional
  mentor_prompt: optional
  next_steps: references/actions
  visibility: publication visibility
  access_level: access policy
  seo: metadata
  source_metadata: provenance
```

This is conceptual; it does not require every field in a production database. Public APIs must exclude `draft` and `review` by default. Future `private` and `restricted` states require access-control architecture. See [content schema](../../schema/content.schema.json), [Taxonomy](./TAXONOMY.md), and [Internationalization](./INTERNATIONALIZATION.md).

Publication timestamps follow [ADR-0012](../adr/0012-conditional-publication-timestamp.md): `draft`, `review`, and `scheduled` items may omit `published_at`, while `published` and `archived` items require a valid offset ISO datetime. The field records actual web publication, not an editorial placeholder or a historical event date.

## Multi-unit works

[ADR-0013](../adr/0013-content-work-ordered-unit-model.md) adds a separate `ContentWork` aggregate for publications whose units must retain one work identity and stable sequence. A work owns localized metadata and explicit ordered unit references. Each `ContentUnit` has a stable canonical identity, exactly one parent work, registered unit type, explicit order, localized slug/body, optional chapter number, and its own publication lifecycle. Existing ContentItems are not migrated or reclassified.

## Video discovery references
[ADR-0034](../adr/0034-bilingual-video-discovery.md) adds a media-reference catalog keyed by existing canonical ID and locale. Titles, Scripture and article links resolve from public ContentItems, not duplicate editorial records. A source fingerprint excludes stale references. MP4/poster/captions, real media publication time and release-event reference are validated by `src/lib/content/published-videos.ts`. This is a delivery projection, not a change to ContentItem or proof of author approval. The initial catalog is empty; adding production entries requires a reviewed media release.

Approved local preparation does not equal publication. Phase 7E keeps review MDX without published_at and production catalogs unchanged. An ignored isolated copy exercises the existing static pipeline with explicitly labelled fixtures, then remains separate from production out/. See [ADR-0035](../adr/0035-faith-multimedia-local-preparation.md).
