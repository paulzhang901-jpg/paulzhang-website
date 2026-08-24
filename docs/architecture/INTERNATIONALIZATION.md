# Internationalization

Chinese and English are first-class from V1. They are representations of one canonical content entity, not unrelated duplicate pages.

```yaml
ContentItem:
  canonical_id: stable id
  translations:
    zh-CN: {slug: ..., title: ..., summary: ..., body: ..., status: ...}
    en-US: {slug: ..., title: ..., summary: ..., body: ..., status: ...}
```

Translation status: `missing`, `draft`, `review`, `published`, `outdated`. Publishing Chinese does not imply English is current.

## Pending locale route decision

Both `/zh/...` + `/en/...` and negotiated/default-locale routing remain valid alternatives. The repository has no established implementation, so this bootstrap deliberately leaves URL locale strategy pending. A later ADR must decide canonical URLs, default locale, redirects, alternates, and SEO behavior before route implementation.

The accepted principle is recorded in [ADR-0009](../adr/0009-bilingual-content-model.md); see [Content Model](./CONTENT_MODEL.md).
