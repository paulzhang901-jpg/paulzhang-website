# Multidimensional Taxonomy

Five independent dimensions are mandatory: `content_type`, `topic`, `life_need`, `journey_stage`, and `audience`. They must not collapse into one category and must not be inferred from route folders.

Canonical values live in [`taxonomy.yaml`](../../config/architecture/taxonomy.yaml) and are validated by [`taxonomy.schema.json`](../../schema/taxonomy.schema.json). Machine identifiers use stable kebab-case within list values; legacy conceptual content types retain the approved snake_case values (`bible_study`, `book_note`, `growth_path`) until an ADR changes them.

Journey stages are `explore → believe → abide → serve → lead → multiply`. They classify formation intent/content; they are not a spiritual-maturity score.

See [ADR-0004](../adr/0004-multidimensional-taxonomy.md), [Route Schema](./ROUTE_SCHEMA.md), and [Content Model](./CONTENT_MODEL.md).
