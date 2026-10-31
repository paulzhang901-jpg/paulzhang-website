# Publication acceptance evidence

- Scope: V1 / ARCHITECTURE-COMPLIANT IMPLEMENTATION; owner Paul Zhang.
- Changes: two localized Library articles and this scoped provenance/verification evidence only.
- Sources: supplied English Markdown and supplied Chinese pasted manuscript. English body retained exactly; Chinese receives Markdown heading prefixes only. Both have six numbered sections and the conclusion, with all supplied Scripture text retained.
- Canonical identity: article-importance-of-coworkers-in-ministry-2026-10-26.
- Existing topics: church, ministry, leadership, discipleship. No taxonomy, routes, core UI, player, analytics, privacy or ADR changes.

## Validation

PASS: npm run validate:content (90 items; 98 optional-field/translation warnings); npm run test:content-integrity (72 tests); npm run test:translation; npm run validate:architecture; npm run test:architecture; npm run test:routes; npm run test:product; npm run test:accessibility; npm run test:performance; npm run test:security; npm run test:media; npm run test:narration-governance; node scripts/validate-fiction-ingestion.mjs; npm run lint; npm run typecheck.

PASS: npm run build -- --webpack; npm run validate:static-export (439/439 production routes; zero broken internal links).

PASS: source integrity and focused HTML verification, recorded in static-qa.json: every source line present, six chapters per locale, one rendered H1, reciprocal language links, canonical/hreflang, Library discovery and sitemap. The original source files are unchanged. Standard staged diff whitespace checking reports one existing English source Markdown hard-break (two trailing spaces after the closing author byline); it is deliberately preserved for exact source fidelity. The check with only blank-at-eol disabled passes.

Local runner note: the runtime pnpm wrapper attempted automatic dependency installation against a shared module symlink and refused safely. The same package scripts were run individually with npm using the existing dependency tree. No dependency files changed. Webpack is the local build runner; the standard CI build is unchanged.

## Release and archive gates

A feature branch and one PR are required. Owner merge is the human authorization boundary under AGENTS.md and ADR-0021; no feature-branch production deployment is permitted. After owner merge, require successful main Quality gates and production deployment, then verify both live routes and language links.

Obsidian: read the vault AGENTS.md and existing 08 Writing/Articles convention. No matching title, slug or canonical ID found in the existing Writing, Library and Sermons directories. Final archive must follow live verification, preserve exact final published bodies and metadata, include source commit and reciprocal bilingual links, and rerun conflict checks before writing. No archive completion claimed before those gates.
