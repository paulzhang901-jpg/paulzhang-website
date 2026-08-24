# Quality Gates v1

## Purpose

The V1 gates protect the approved architecture, public content boundary, bilingual routing, accessibility baseline, and build health. They apply to every pull request and to every push to `main`. A failing blocking gate means the change is not merge-ready; checks must not be bypassed.

## Blocking gates

| Group | Required contracts |
|---|---|
| Architecture | Registry/schema parsing, internal consistency, accepted ADR completeness, Markdown links, and release boundaries |
| Application | ESLint, strict TypeScript, public and localized route contracts, accessibility baseline, and production build |
| Content | Content validation, canonical and slug uniqueness, canonical taxonomy references, internal references, translation integrity, public filtering, and SearchDocument safety |
| Security | Repository secret scan with a non-zero exit on a confirmed credential or private-key pattern |

The final `validate` job depends on all four groups and preserves one stable required-check name for branch protection.

## Non-blocking and reporting safeguards

V1 does not impose Lighthouse scoring or arbitrary line-coverage percentages. Lightweight performance contract tests report or fail only on clear regressions: an unreviewed Client Component or a raw public asset larger than 1 MiB. Broader performance budgets may be proposed after real production measurements exist.

## Accessibility baseline

The current Next.js shell is oriented toward WCAG 2.2 AA and must retain:

- semantic `header`, labelled navigation, `main`, and `footer` landmarks;
- a keyboard-visible skip link targeting the main landmark;
- one page-level heading supplied by the shared page/content shells;
- visible `:focus-visible` treatment and keyboard-operable native controls;
- accessible names for primary, mobile, breadcrumb, and footer navigation;
- Next.js Core Web Vitals lint rules, including image alt-text readiness;
- reduced-motion handling through `prefers-reduced-motion`.

These are baseline contract checks, not an accessibility certification. Manual keyboard and assistive-technology review remains necessary before public release.

## Test philosophy

Test observable contracts and safety boundaries. Avoid brittle large snapshots, trivial implementation assertions, and arbitrary coverage targets. A regression test should explain which public, editorial, architecture, privacy, or accessibility contract it protects.

## Secret handling

Never commit credentials, private keys, environment files containing secrets, or sensitive ministry submissions. The scan detects high-confidence credential patterns in tracked files and fails CI. A finding is removed and rotated where applicable; it is never suppressed merely to make CI green.

## Failure classification

- **Architecture failure:** stop implementation and reconcile the accepted ADR/specification before proceeding.
- **Application or build failure:** fix the implementation or dependency contract without weakening the gate.
- **Content failure:** correct schema, taxonomy, publication boundary, translation, or reference integrity.
- **Security failure:** treat as blocking, remove the material, rotate exposed credentials, and review history.
- **Accessibility/performance safeguard failure:** fix the regression or document a reviewed exception through governance.

Pull requests must include local evidence for all applicable gates. After merge, the same workflow revalidates `main`.
