# One Phrase, One Story — free e-book integration

Classification: ARCHITECTURE-COMPLIANT IMPLEMENTATION. Version: V1.
Owner: Paul Zhang. Goal: place the existing Chinese and English book PDFs in the Library's free e-book section, as explicitly requested by the owner.

## Scope and acceptance

Allowed paths: Library component, one book-specific display component and catalogue, the two public PDFs, one proportionally resized cover, route tests, and this delivery note. No article body, taxonomy, route, tracking, API, or dependency changes.

Architecture references: existing Library / free e-book design, ADR-0011 locale URLs and ADR-0021 protected-main production delivery. No ADR change. No analytics or privacy impact. This is a download catalogue addition, not a new original editorial article or a second canonical body.

Both /library#one-phrase-one-story and /en/library#one-phrase-one-story must display the Chinese and English editions, each with online reading and free download links. Existing Light series and John textbook catalogue remain intact. Only PDFs are exposed; DOCX, bilingual edition, source manuscripts and internal reports are excluded.

Both PDFs are unchanged AUTHOR REVIEW DRAFT files; editorial, reference and etymology review remains pending. Free availability does not imply publication approval. The original green-and-gold cover is preserved; only the website thumbnail is scaled to 400 × 600, with no cropping, logo or name alteration.

## Validation

New bilingual Library integration tests pass (2); existing Together and John catalogue tests pass (4). ESLint and TypeScript pass. Architecture validation and content validation pass (existing optional-content warnings retained). Route/product/translation contracts: 113 pass. Architecture/accessibility/performance/security checks: 50 pass.

The isolated checkout reuses copied cached dependencies. Local Turbopack was blocked first by its external-symlink root restriction and then by sandbox port binding. The unchanged application builds successfully with Next.js webpack mode; all 460 static routes validate, with zero broken internal links, and both exported PDFs match the source bytes. CI retains the unmodified standard Turbopack build. Independent code review found no actionable issues. Normal PR checks and protected merge remain required; no feature-branch deployment. Production verification is recorded separately after it actually completes.

## Exact PDF delivery identities

```json
[
  {
    "path": "public/ebooks/one-phrase-one-story-chinese-author-review.pdf",
    "bytes": 4320813,
    "sha256": "ada8840f0b0b5fff782b910dd6ec15bb95e69f471fba80b69fca4fd3ec3fa4d3"
  },
  {
    "path": "public/ebooks/one-phrase-one-story-english-author-review.pdf",
    "bytes": 2942461,
    "sha256": "33d90d480c9f451f15024ff274300c38f50b8f47169b4eb247590abfaa106af7"
  }
]
```
