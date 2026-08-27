# Little Wheat Runtime Execution Contract v1

Status: Complete
Date: 2026-08-26
Contract step: Step 5R6
Scope: Runtime materialization authority only

## Authority chain

This contract incorporates the approved results of:

1. Step 5R3 — Physical Canonical Package Materialization v1
2. Step 5R4 — Human-Approved Canonical-to-Runtime Mapping Contract v1
3. Step 5R5 — Runtime Metadata Closure Audit v1
4. Step 5R6 — Final Runtime Execution Contract v1

The physical canonical package remains the immutable semantic authority. This contract authorizes deterministic runtime representation; it does not authorize editorial changes.

## Physical canonical package

- Package directory identity: `little-wheat-physical-canonical-package-v1-r1`
- Package ID: `little-wheat-canonical-publication-package-v1`
- Work ID: `work-little-wheat-v1`
- LOCK status: `MATERIALIZED_LOCKED_CODEX_READY`
- LOCK SHA-256: `1b63b32cf1eb64b9cbd8daea733084d15fb5dfc8352849c74f4e44c2ed8d7a99`
- Controlled files: 41
- Hashed controlled files: 40
- zh-CN textual units: 15
- en-US textual units: 15
- Registries: 10
- Media assets: 0

## Work classification

- Canonical semantic genre: `family_testimony`
- Runtime `work_type`: `story_book`

This is a representation mapping. It does not alter `canonical.yaml`.

## Human-approved runtime summaries

### zh-CN

《麦子落地》是一部纪念小麦子短暂生命的家庭信仰见证，记录一个家庭在爱、失去、哀伤与盼望中的真实经历，并见证上帝如何在苦难中以恩典托住生命，引领人重新仰望基督与永恒的盼望。

### en-US

Little Wheat is a family testimony remembering the brief life of Little Wheat, telling a true story of love, loss, grief, and hope, and bearing witness to God’s sustaining grace in suffering and the enduring hope found in Christ and eternity.

Classification: `HUMAN_AUTHORED`, `HUMAN_APPROVED`, `EDITORIAL_METADATA`, `RUNTIME_AUTHORIZED`.

These summaries are runtime metadata. They must not be represented as byte-derived manuscript content or inserted into the locked manuscript files.

## Unit-title rule

For every localized ContentUnit:

```text
runtime title = existing explicit first document heading
```

The heading text must remain exact. No rewriting, translation, synthesis, normalization, or combination with later descriptive headings is authorized. Step 5R5 resolved 30 of 30 titles under this rule.

## Slug rule

For every localized ContentUnit:

```text
localized_runtime_slug = basename(canonical_structure_path)
```

The locale remains outside the slug field and is supplied by the existing route architecture. Step 5R5 verified 30 of 30 proposed slugs against the runtime regex and locale-scoped uniqueness requirements.

## Runtime identity rule

Direct canonical-ID reuse is required:

```text
Work runtime_id = Work canonical_id
Unit runtime_id = Unit canonical_id
```

- Work runtime ID: `work-little-wheat-v1`
- Unit runtime IDs: the 15 canonical unit IDs in `structure.yaml`
- Generated UUIDs, locale-specific replacement IDs, normalization, and semantic rewriting are prohibited.

## Cross-language identity

The runtime identity model is:

- one canonical Work with zh-CN and en-US representations;
- 15 canonical Unit identities;
- one zh-CN and one en-US localized record for each Unit identity;
- 30 localized records total, not 30 independent canonical units.

Localized identity is resolved through `canonical_id + language` under the existing ContentWork repository.

## Step 5R4 deterministic mappings

### Order

```text
runtime_order = canonical_order + 1
```

Canonical orders `0–14` map to runtime orders `1–15` without semantic reordering.

### Unit types

| Canonical semantic type | Runtime unit type |
|---|---|
| `dedication` | `front_matter` |
| `prologue` | `front_matter` |
| `chapter` | `chapter` |
| `guest_testimony` | `chapter` |
| `father_letter` | `chapter` |
| `digital_memory_album` | `chapter` |
| `theological_reflection` | `chapter` |
| `eschatological_reflection` | `chapter` |
| `family_statement_of_faith` | `supplement` |

Canonical semantic types remain unchanged in the locked registry.

### Physical paths

An extensionless canonical structure path resolves to the same path plus `.md` only when the extensionless path is absent, exactly one `.md` match exists, and that match is a file. Step 5R5 verified 30 of 30 paths.

## Publication and access state

```yaml
status: review
published_at: null
visibility: private
access_level: public
public_discovery: false
search_indexing: false
sitemap_inclusion: false
```

`access_level: public` means unrestricted readership after an authorized publication transition. It does not make review/private content publicly visible.

No publication transition, timestamp, SEO, related-content relationship, or public exposure is authorized by this contract.

## Chapter 8 boundary

- Pastor John independent original English: `MISSING`
- Reverse translation as original: `PROHIBITED`
- Synthetic original: `PROHIBITED`
- Legacy embedded English as verified original: `PROHIBITED`
- The locked en-US representation must remain unchanged.

## Immutable boundaries

Runtime materialization must not modify canonical prose, translations, headings, registries, LOCK semantics, canonical IDs, canonical order, canonical semantic unit types, facts, theology, provenance, privacy, or publication history.

No media import, SEO invention, publication timestamp invention, related-content invention, canonical rewriting, translation, or provenance resolution is authorized.

## Final validation

| Requirement | Result |
|---|---|
| Work classification | Resolved |
| Work summaries | 2/2 resolved |
| Localized unit orders | 30/30 resolved |
| Unit types | 15/15 resolved |
| Unit titles | 30/30 resolved |
| Unit slugs | 30/30 resolved |
| Work runtime ID | Resolved |
| Canonical Unit runtime IDs | 15/15 resolved |
| Cross-language identity | Resolved |
| Physical paths | 30/30 resolved |
| Publication state | Resolved |
| Visibility | Resolved |
| Access level | Schema-compatible |
| Chapter 8 missing-source boundary | Preserved |
| Additional mandatory execution fields | 0 |

Final contract state:

```text
RUNTIME AUTHORITY: CLOSED
UNRESOLVED MANDATORY FIELDS: 0
ARCHITECTURE CONFLICTS: 0
READY FOR CHECKPOINT A REVALIDATION
```
