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
  published_at: timestamp
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
