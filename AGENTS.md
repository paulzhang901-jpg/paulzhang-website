# paulzhang.org Repository Constitution

## Mandatory reading

Before architecture-relevant work, read:

1. `docs/product/PRODUCT_NORTH_STAR.md`
2. `docs/product/WEBSITE_IA_V1.md`
3. `docs/architecture/ARCHITECTURE.md`
4. the relevant architecture documents and accepted ADRs

Classify substantial work as `ARCHITECTURE-COMPLIANT IMPLEMENTATION`, `ARCHITECTURE EXTENSION`, or `ARCHITECTURE CHANGE`. Only the first may proceed directly.

## Architecture change rule

A task is an architecture change if it alters top-level routes, content model, taxonomy, journey state machine, canonical events, privacy boundaries, AI boundaries, internationalization strategy, release boundaries, identity architecture, Growth Path stages, or the GCCM integration contract.

For a change: **STOP → create/update ADR → review impact → update architecture docs → update registries/schemas → implement.** Implementation must not precede the decision.

## Conflict protocol

Report conflicts exactly as:

```text
ARCHITECTURE CONFLICT
Requested behavior: ...
Conflicting architecture: ...
Relevant file / ADR: ...
Impact: ...
Recommended resolutions:
A. Implement within current architecture
B. Amend architecture through ADR
C. Defer to future release
```

Never silently reinterpret approved architecture. Accepted ADRs outrank architecture docs, IA, requirements, implementation docs, and code. If code conflicts, the code is the defect.

## Scope, content, AI, and privacy

- Identify every task as V1, V1.5, or V2. Later-scope work must not enter V1 for convenience.
- Never duplicate canonical content merely to serve another surface; reference the canonical entity.
- AI may assist, navigate, retrieve, reflect, and bridge to people. It must not replace pastors, mentors, churches, therapists, or spiritual authority.
- Never place prayer text, marriage disclosures, grief narratives, counseling/companionship submissions, or private reflections into generic analytics or logs.
- Never infer spiritual worth, salvation, holiness, or maturity from platform state. No hidden spiritual score.

## Delivery gates

A task is READY only when it identifies Goal, Owner, Scope, Allowed Paths, Architecture Reference, Version Boundary, Acceptance Criteria, Tests, Analytics Impact, Privacy Impact, and ADR Impact.

A task is DONE only after implementation → tests → acceptance evidence → architecture compliance → privacy review → review → merge → main revalidation.

## Standard website article publishing workflow

When the owner says **“按网站文章发布流程处理这篇文章。”**, treat it as the standard publishing instruction:

1. Preserve the supplied article body exactly unless the owner explicitly asks for editorial changes.
2. Classify the article using the existing canonical content model and taxonomy; do not create a competing content source or taxonomy for convenience.
3. Create or adapt the required metadata/frontmatter and preserve canonical identity, locale, slug, visibility, access, and publication rules.
4. When a Chinese/English pair is supplied or authorized, maintain the repository's established bilingual canonical relationship and English Scripture policy; never fabricate a translation that was not requested or approved.
5. Keep GitHub repository content as the website source of truth. Synchronize/archive to the established Obsidian/GitHub architecture only through its existing governed workflow; never duplicate canonical website content into a second competing source.
6. Run the required content, translation, architecture, application, security, and static-export checks applicable to the change.
7. Work on a feature branch and create exactly one Pull Request with only the scoped publication changes.
8. Never deploy production from a feature branch or Pull Request.
9. After the owner merges the PR to `main`, the GitHub Actions production job automatically reruns blocking validation, builds and validates `out/`, and deploys that exact static export to the approved Cloudflare Pages production project under ADR-0021.
10. Confirm the GitHub Actions deployment succeeds and verify the published route on `https://paulzhang.org` before reporting publication complete.
