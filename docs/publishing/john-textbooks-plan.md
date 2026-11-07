# Gospel of John textbook website publication

Goal/owner: publish Paul Zhang's supplied six-book catalogue in the existing free e-books section.
Scope/version: V1, ARCHITECTURE-COMPLIANT IMPLEMENTATION. Existing bilingual /library routes, content repository, taxonomy and other e-books remain intact.
Allowed paths: library presentation, textbook metadata, existing cover assets, focused route tests and this delivery record.
Architecture: PRODUCT_NORTH_STAR, WEBSITE_IA_V1, ARCHITECTURE, ADR-0011 and ADR-0021. No ADR change.
Design: retain the current card styles and responsive grid; add a distinct bilingual series with two language groups. Use the supplied introductions verbatim. Preserve book-cover proportions. Show actual PDF page count and size. No PDF editing or generation.
Rights: existing publication reports say NIV permission is pending. Public catalogue and covers only; no textbook PDFs in public/, no active links. Personal study only, no commercial use. Written authorization for this exact public downloadable use plus file verification are prerequisites for activation.
Analytics/privacy: no events, tracking, forms, external embeds or personal data added.

## Implementation and acceptance

- [x] Pin six existing final PDF hashes, sizes and page counts; reuse English cover PNGs and render existing Chinese cover pages as website thumbnails only.
- [x] Add six cards in Chinese/English groups and complete supplied bilingual introductions within FreeEbooks.
- [x] Verify both locale renders, existing e-books, no textbook download links/public PDFs, cover assets and responsive layout.
- [x] Run relevant repository validation, typecheck, full tests, production build and static export validation.
- [ ] Review scoped diff; create one GitHub PR. Main-only automatic deployment follows owner review/merge under ADR-0021.

## Acceptance evidence (2026-11-06)

- Full repository test command: 298 tests passed, zero failures. Typecheck, lint, architecture validation, content validation and fiction ingestion checks passed. Content validation retains 121 existing optional/translation warnings; no content files changed.
- Production `next build --webpack` succeeded. Static export validation: 454/454 routes, zero broken internal links, locale/canonical and public/private checks passed.
- Default Turbopack build could not finish locally because its CSS worker was denied port binding by the execution sandbox. No configuration/workflow change made; the standard build remains a required GitHub CI gate.
- Browser acceptance on built Chinese and English library pages: 1440×1000 desktop, 820×1180 tablet, 390×844 mobile. No document/card horizontal overflow, all six covers loaded, all six buttons disabled. Existing Chinese library still reports 47 resources; existing three e-book download links intact. Browser dimensions simulated; no physical-device claim.
- Independent review: no blocking findings. No added analytics or external resource fetches.
- All six source PDF SHA-256 hashes rechecked after implementation; unchanged. Cover artwork only resized/encoded to WebP for the existing 1 MiB public asset budget. Original source covers and backs remain untouched in the publication project.

## Download release procedure

The six PDFs intentionally remain outside Git and public/out. `src/lib/content/john-textbooks.json` pins their existing relative publication paths, SHA-256 hashes, byte sizes and page counts. It is file inventory, not a release authorization.

Before enabling downloads: obtain written permission expressly covering these NIV-containing educational PDFs and public downloadable distribution. Check the scope for both language editions and all volumes. Reference the permission evidence in the release review; verify source hashes, storage limits and approved hosting; then add verified downloadable assets and replace disabled buttons with tested links in a separate reviewed PR. A personal/non-commercial label alone is insufficient. Never expose files merely by adding them to public/ while leaving the buttons disabled.

Sources inspected: original Chinese Gospel-of-John-Publishing-Report.md; English-Edition/covers/cover-integration-report.md (2026-11-06); docs/phase4/bible-versions-and-rights.md in the existing publication project. Official policy checked 2026-11-06: https://www.biblica.com/permissions/ (general use excludes a complete Bible book and requires written permission outside its limits; unrestricted downloadable use needs specific confirmation).

Publishing: feature branch only; one PR to main. ADR-0021 makes owner review/merge the production boundary. No feature-branch production deployment, no bypass of reviews/checks. Deployment is not complete until main Actions and public routes are verified.
