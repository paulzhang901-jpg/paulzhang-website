# Mu Changke Fiction — Adapter Validation Report

Status: **PASS**

## Canonical inputs

- `canonical.yaml`
- `works.yaml`
- `editorial/*.json` — exactly 12 LOCKED packages
- `covers/manifest.json`
- `covers/assets/*` — exactly 12 approved source covers
- `publication-rights.yaml`
- `provenance.yaml`
- `media-ledger.yaml`
- `editorial-approval-record.yaml`
- `execution-contract.yaml`
- `PACKAGE-LOCK-MANIFEST.json`

All inputs remain under `config/fiction/intake/mu-changke-fiction-canonical-package-v1-final/` and are immutable.

## Derived outputs

- `config/fiction/intake/canonical-registry/registry.json`
- `config/fiction/intake/editorial-packages/*.json` — 12 files
- `config/fiction/intake/covers/manifest.json`
- `config/fiction/intake/DERIVATION-MANIFEST.json`

Derived outputs are implementation data, not canonical editorial authority. The derivation manifest marks all outputs `DERIVED_FROM_LOCKED_CANONICAL_PACKAGE` and records output SHA-256 values.

## Mapping rules

- Canonical identity and slug: exact values from `works.yaml`.
- Editorial copy: exact fields from each locked `publicEditorial` object.
- Reading-experience arrays: item text remains exact; newline separators provide the repository string representation.
- CTA: exact `officialReadingCTA.text`; `verifiedUrl` must be `null`.
- Editorial version: exact `editorialVersion`, falling back to the author-approved `edition` field.
- Work type: fixed repository implementation metadata `fiction`.
- Collection: fixed repository implementation metadata `mu-changke-fiction`.
- Cover linkage: cover key equals the locked editorial filename basename.
- Cover alt text: deterministic accessibility label using the exact canonical title.
- Rights status: exact `website_role` from `publication-rights.yaml`.

## Integrity proof

- Pre-adapter protected hashes: 34/34 PASS
- Post-adapter protected hashes: 34/34 PASS
- Canonical byte changes: 0
- Editorial field mapping: 12/12 PASS
- Schema validation: PASS
- Cross-reference validation: 12/12 PASS
- Rights/public boundary: PASS
- Unverified URLs: 0
- Manuscript/chapter/contract/internal-rights exposure: 0

## Execution

```text
node scripts/fiction-ingestion-adapter.mjs
node scripts/validate-fiction-ingestion.mjs
```

Both commands returned PASS. No application page or public asset was created.
