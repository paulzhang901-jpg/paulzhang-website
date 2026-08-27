# Mu Changke Fiction receiving contract

This directory is governance infrastructure only. It contains no public editorial package and authorizes no `/fiction` page implementation.

## Required source delivery

Supply one machine-readable `Mu Changke Fiction Editorial Registry v1.0` containing exactly the twelve identities in `work-identities.json`. Every record must validate against `schema/fiction-editorial-package.schema.json` and must use `editorialStatus: LOCKED`.

Missing optional approved fields must be explicit `null` values and must remain hidden in presentation. Codex must not generate, rewrite, summarize, translate, or infer them.

Supply twelve independently addressable cover assets plus an approved title-to-asset mapping. A mapping remains `COVER_MAPPING_BLOCKED` until the asset path, SHA-256, alt text, and website rights are verified. No substitute cover is permitted.

Manuscripts, chapters, contracts, screenshots, drafts, superseded versions, internal rights analysis, and excluded works must never be placed in this directory or any public application namespace.
