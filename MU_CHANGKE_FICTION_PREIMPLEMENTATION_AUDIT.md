# Mu Changke Fiction — Preimplementation Audit v1

Date: 2026-08-27

Classification: **ARCHITECTURE CHANGE — BLOCKED BEFORE IMPLEMENTATION**

Current repository state at audit start:

- Repository: `paulzhang-website`
- Branch: `main`
- Local HEAD: `d505fbab4f95c5fb8775db0d58e20352d89f7114`
- `origin/main`: `d505fbab4f95c5fb8775db0d58e20352d89f7114`
- Working tree before this audit: clean

## 1. Implementation plan

Implementation cannot begin in the present architecture state. The governed sequence is:

1. Materialize the authoritative `Mu Changke Fiction Editorial Registry v1.0`, all 12 independently verifiable LOCKED website editorial packages, and an explicit cover-to-work mapping in a deterministic source location.
2. Verify exactly 12 approved works, all required fields, canonical version rules, excluded-work absence, rights-safe excerpts/descriptions, CTA wording, and hashes or an equivalent editorial integrity manifest.
3. Resolve the new top-level `/fiction` namespace through an accepted ADR, impact review, synchronized IA/route architecture, machine-readable route registry, and architecture tests. ADR-0002 forbids adding an ungoverned top-level route.
4. Re-run Checkpoint A. Only a complete PASS may authorize creation of the dedicated branch/worktree.
5. Implement one registry-driven discovery portfolio with `/fiction` and `/fiction/[slug]`, approved metadata only, lightweight filtering, explicit cover bindings, rights-safe external-reading guidance, bilingual UI shell, and no manuscript/full-text routes.
6. Run content-integrity, route, accessibility, China-accessibility, lint, typecheck, test, build, desktop/mobile smoke, and rights-boundary validation.
7. Stop at Checkpoint B. Only after full PASS prepare one focused PR; do not merge.

## 2. Exact files/directories expected to change

The final list cannot be authorized until the ADR and canonical package paths are approved. The minimum anticipated surfaces are listed for impact review only; this is not implementation authorization.

### Architecture decision and synchronization (must precede product implementation)

- `docs/adr/0014-*.md` — exact name subject to governance review
- `docs/adr/README.md`
- `docs/product/WEBSITE_IA_V1.md`
- `docs/architecture/ROUTE_SCHEMA.md`
- `docs/architecture/ARCHITECTURE.md` only if the accepted decision materially requires it
- `config/architecture/routes.yaml`
- `tests/architecture/validate.mjs` and/or the existing architecture route tests

### Product implementation (only after architecture acceptance and Checkpoint A PASS)

- a canonical structured fiction registry under an approved content/config namespace; exact path blocked pending source mapping
- explicit cover assets under an approved `public/` namespace; exact paths blocked pending mapping
- `src/app/(zh)/fiction/page.tsx`
- `src/app/(zh)/fiction/[slug]/page.tsx`
- corresponding shared locale-aware `/en` projection, following ADR-0011 rather than duplicating application logic
- shared fiction repository/query/presentation components under `src/lib/` and `src/components/`; exact paths to follow existing conventions
- minimal i18n navigation/label/metadata bindings required by the accepted route decision
- sitemap/SEO bindings only for approved public metadata
- focused fiction route, registry, filtering, rights-safety, integrity, accessibility, and rendering tests under `tests/`

No chapter, manuscript, download, contract, or full-text route/file is expected.

## 3. Available content/assets

### In the repository

- No Mu Changke fiction registry was found.
- No independently verifiable LOCKED website editorial package for any of the 12 works was found.
- No fiction cover asset or cover mapping was found.
- Existing reusable infrastructure includes Next.js App Router, strict TypeScript, Tailwind/design tokens, locale-aware routing, metadata helpers, public-content filtering, `ContentWork` primitives, accessibility/performance tests, and static image handling.
- Existing Little Wheat files are a separately governed product and are not source material for this task.

### Outside the repository observed during discovery

Draft manuscripts, revision files, PDFs, DOCX files, and publishing contracts exist in user folders. They are explicitly non-authoritative under this task and were not used to reconstruct editorial packages, metadata, excerpts, identity, URLs, or cover mappings.

The task attachment describes the intended 12 works and governance rules, but it does not physically supply the asserted `Mu Changke Fiction Editorial Registry v1.0`, the 12 full website editorial packages, or an integrity manifest.

## 4. Missing assets

- 12 independently addressable approved cover files, or an explicit declaration that a named work intentionally has no cover
- deterministic mapping of each canonical work identity/slug to one approved cover path
- approved alt text if it belongs to the editorial package
- asset provenance/rights confirmation sufficient for website use

No substitute, generated, inferred, retouched, or manuscript-derived cover may be used.

## 5. Cover mapping status

**COVER_MAPPING_BLOCKED**

No canonical mapping file or approved cover set was found. Filename guessing and visual substitution are prohibited.

## 6. Rights-safety controls

Required controls are clear and implementable after canonical materialization:

- only approved metadata and approved short editorial excerpts may enter public records;
- manuscript and contract paths/content must be rejected by deterministic validation;
- no chapter/full-text/download/manuscript/contract route;
- no manuscript passage in metadata, JSON-LD, OpenGraph, hidden DOM, client search data, or structured data;
- external CTA remains platform-search guidance using canonical title plus author `牧长客`, without invented deep links or platform IDs;
- only `editorialStatus: LOCKED` records may become public fiction portfolio records;
- 《火没有降下来》 must be `canonicalVersion: v3`; v1/v2 must be absent from public content;
- 《为什么偏偏是我》 and 《每个人都来安慰他》 must be absent;
- optional sections render only when the approved package supplies them;
- the final PR must expose a deterministic editorial diff/hash signal.

The boundary design is **PASS**, but enforcement cannot be validated without the physical canonical packages and mapping.

## 7. Test plan

- registry count equals 12 and all records are `LOCKED`;
- exact canonical titles and identities match the authoritative registry;
- 12 landing/detail routes resolve; excluded titles do not;
- `/fiction` and `/fiction/[slug]` match the accepted route registry and ADR-0011 locale projection;
- no `/zh`, chapter, read, download, manuscript, or contract routes;
- 《火没有降下来》 is v3 and no v1/v2 public material exists;
- required/optional package-field behavior is deterministic;
- every cover mapping resolves to the explicitly approved asset;
- CTA contains no invented URL/ID and exposes no manuscript or contract reference;
- public metadata/search/JSON-LD contains approved fields only;
- search/filter covers the approved metadata dimensions and does not index source manuscripts/contracts;
- integrity check fails on non-LOCKED status, prohibited draft markers, manuscript/contract references, or unapproved public content;
- semantic headings, keyboard flow, visible focus, alt text, contrast, reduced motion, and responsive rendering;
- no critical inaccessible third-party runtime dependency or Google-hosted critical asset;
- lint, strict typecheck, complete tests, route validation, production build, secret scan, and desktop/tablet/mobile smoke review.

## 8. Blockers

### BLOCKER 1 — PHYSICAL_CANONICAL_REGISTRY_MISSING

The authoritative `Mu Changke Fiction Editorial Registry v1.0` is not physically present in the repository or supplied as a separately verifiable attachment.

### BLOCKER 2 — EDITORIAL_PACKAGES_0_OF_12

The 12 LOCKED website editorial packages are not physically available for field-by-field verification. Manuscripts, contracts, memories, and task prose may not be used to reconstruct them.

### BLOCKER 3 — COVER_MAPPING_BLOCKED

No approved 12-work cover set and no explicit canonical cover mapping are available.

### BLOCKER 4 — NEW_TOP_LEVEL_ROUTE_REQUIRES_ADR

`/fiction` is absent from `docs/product/WEBSITE_IA_V1.md`, `docs/architecture/ROUTE_SCHEMA.md`, and `config/architecture/routes.yaml`. ADR-0002 states that new top-level routes require an ADR. The repository constitution requires the ADR, impact review, documentation synchronization, registry/schema update, and validation before implementation.

## Architecture conflict

```text
ARCHITECTURE CONFLICT
Requested behavior: Add the new public top-level routes /fiction and /fiction/[slug].
Conflicting architecture: /fiction is not an approved or reserved top-level namespace, and new top-level routes require a prior ADR.
Relevant file / ADR: docs/adr/0002-route-architecture.md; docs/architecture/ROUTE_SCHEMA.md; docs/product/WEBSITE_IA_V1.md; config/architecture/routes.yaml
Impact: Direct implementation would create route-registry and IA drift and would violate the repository change-control gate.
Recommended resolutions:
A. Implement within current architecture (for example under an already governed namespace), only if human product governance explicitly changes the requested route contract
B. Amend architecture through an accepted ADR, then synchronize IA, route documentation, machine registry, and tests before implementation
C. Defer to a future release
```

Recommended resolution: **B**.

## Checkpoint A conclusion

Checkpoint A is blocked. No branch/worktree, application code, public content record, cover asset, route, test implementation, commit, push, or PR may be created from this audit state.
