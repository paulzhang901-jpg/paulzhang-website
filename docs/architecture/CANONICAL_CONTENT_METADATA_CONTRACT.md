# Canonical Content Metadata Contract — Phase 2A

Status: **PROPOSED FOR OWNER REVIEW**

## Ownership
**Repository owns canonical content. Library organizes truth resources. Growth Pathway curates formation journeys.**

Protected models remain authoritative: Sermons retain approval/canonical-edition/hash/Human-Preview/publication gates; ContentWorks / ContentUnits retain parent/order/locale/publication gates; Fiction references retain LOCKED metadata, rights, exclusions, and official-reading constraints. Adapters are one-way safety boundaries and cannot manufacture public eligibility.

## Ordinary frontmatter
schema/content-frontmatter-v2.schema.json is the Phase 2A serialization contract.

Required core: schema_version, id, canonical_id, slug, status, title, summary, content_type, primary_topic, language, visibility, access_level. Published or archived content additionally requires valid published_at.

Optional metadata: secondary_topics 0..N; growth_stages 0..N; life_domains 0..N; plus existing life_needs, audiences, scripture_refs, related_content, and formation metadata. Do not infer optional classification merely to make a record validate.

Form and subject remain orthogonal. Prefer content_type: article with primary_topic: gospel. gospel-essay is not added in Phase 2A.

## Controlled values
Primary topics: bible, gospel, faith, spiritual-life, marriage-family, life-values, money-work, church-mission.

Growth stages: explore, believe, abide, serve, lead, multiply.

Life domains: faith, life, family, work, ministry, mission.

No new secondary-topic term is added. relationships is excluded. Existing topics, life_needs, audiences, and scripture_refs carry fine-grained meaning where appropriate. New controlled terms require evidence plus architecture approval.

## Grace Pathway
General content does not require a growth stage. Explicit Grace Pathway formation material may use a stricter validator requiring at least one growth_stages value. V1 is six stage explanations plus automatically queried related public resources. Ordered pathways are V1.5; progress, identity, mentoring, and community workflows are later.

## Legacy compatibility
No Phase 2A migration/reclassification. Preserve legacy topics and journey_stages; registered journey values may project to growth_stages when unambiguous. Missing life domain is valid. article plus gospel remains article. Preserve URLs/canonical IDs. Protected sermon/work/fiction uses specialized validation first. Future contradictory legacy/canonical fields must fail closed.

## Zod / JSON Schema consistency
The repository currently has a conceptual aggregate JSON Schema and a separately authored runtime Zod frontmatter schema. Phase 2A adds no third runtime parser. Phase 2B must either generate runtime validation/types from the canonical v2 schema plus controlled registry, or retain hand-authored Zod only with deterministic parity tests for required/optional fields, enums, cardinality, publication timestamps, and controlled taxonomy. Drift must fail CI.

## Automatic-discovery acceptance
For an ordinary item using registered type/taxonomy, publication must ultimately require only content file, valid metadata, and optional approved media. No per-item change may be required in src/, navigation, route components, collection configuration, sitemap code, or search code. Eligibility, canonical URL, collections, related resources, search, and sitemap membership must derive automatically from the canonical repository projection.

## Deferred
/writing is future aggregation only; /fiction remains unchanged. Light Journey is unresolved with no route/taxonomy/redirect or /gccm-/journey rename. Runtime activation/migration of v2 metadata waits for Phase 2B review.
