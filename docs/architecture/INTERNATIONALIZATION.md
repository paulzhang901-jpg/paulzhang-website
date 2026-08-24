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

## Accepted locale route strategy

`zh-CN` is the default locale and uses unprefixed URLs such as `/library`. `en-US` uses `/en` and `/en/library`. `/zh` is forbidden. Explicit user choice outranks browser language; browser language is only a hint and must not trigger forced redirects. Technical route segments remain stable English identifiers, while UI copy and editorial content are localized.

Shared application logic serves both locales. For canonical editorial content, `canonical_id` links translations even when localized slugs differ. The language switcher resolves an available counterpart; when unavailable it presents a translation-unavailable state. Translated equivalents support canonical URLs and `hreflang` for `zh-CN` and `en-US`.

See [ADR-0009](../adr/0009-bilingual-content-model.md), [ADR-0011](../adr/0011-locale-url-strategy.md), [Content Model](./CONTENT_MODEL.md), and the [route registry](../../config/architecture/routes.yaml).
