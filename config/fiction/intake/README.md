# Mu Changke Fiction physical handoff intake

Status: **EMPTY — AWAITING AUTHORITATIVE PHYSICAL HANDOFF**

This is a non-public receiving area. Nothing under this directory is a public fiction record, a client-side data source, or authorization to implement `/fiction` pages.

## Exact intake locations

| Material | Deposit location | Rule |
|---|---|---|
| Canonical Registry v1.0 | `config/fiction/intake/canonical-registry/registry.json` | Supply exactly one machine-readable JSON registry at this contract-defined path. |
| 12 LOCKED editorial packages | `config/fiction/intake/editorial-packages/` | Supply exactly twelve independently addressable JSON packages. Filenames and mapping must be declared by the canonical registry or a signed package manifest. |
| Cover assets | `config/fiction/intake/covers/assets/` | Supply exactly twelve approved independent image files. Their filenames must come from the authoritative cover manifest. No substitute or generated cover. |
| Cover manifest | `config/fiction/intake/covers/manifest.json` | Supply exactly one machine-readable JSON manifest at this contract-defined path. |
| Internal rights-safe metadata | `config/fiction/intake/internal-rights/` | Supply only the minimum approved machine-readable rights metadata needed for validation. Never supply contract text, contract screenshots, manuscripts, chapters, or internal legal analysis. |

## Validation before promotion

No intake file may be imported into runtime or moved to `public/` until all of the following pass:

1. Registry validates against `schema/fiction-editorial-registry.schema.json`.
2. Every editorial package validates against `schema/fiction-editorial-package.schema.json` and has `editorialStatus: LOCKED`.
3. Registry contains exactly the twelve approved identities in `config/fiction/work-identities.json`, with no excluded work.
4. 《火没有降下来》 remains canonical version `v3`; v1 and v2 are rejected.
5. Cover manifest validates against `schema/fiction-cover-manifest.schema.json` and maps each approved identity exactly once.
6. Every cover file exists, is readable, is a valid supported image, matches its declared SHA-256, has approved alt text, and has verified website-use rights.
7. Public editorial records contain only fields allowed by `config/fiction/rights-guardrails.json`.
8. No DOC, DOCX, PDF, raw manuscript text, chapter, contract, screenshot, source path, draft, superseded text, or internal rights analysis is present.
9. Missing optional editorial fields remain explicit `null`; they are never generated or inferred.
10. Official-reading URLs remain non-clickable unless explicitly supplied and independently verified.

After validation, a separate implementation task may promote only approved public-safe registry data and verified web cover assets. Intake source files must not be directly bundled into client code or public HTML.
