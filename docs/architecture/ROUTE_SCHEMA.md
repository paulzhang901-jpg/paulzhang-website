# Route Schema

Machine source: [`config/architecture/routes.yaml`](../../config/architecture/routes.yaml). Decision: [ADR-0002](../adr/0002-route-architecture.md).

Locale routing follows [ADR-0011](../adr/0011-locale-url-strategy.md): `zh-CN` uses the canonical unprefixed routes, while `en-US` mirrors approved public routes beneath `/en`. `/zh` is not allowed. Locale prefixing does not create a second domain or taxonomy tree.

Reserved top-level namespaces: `/`, `/start`, `/library`, `/stories`, `/together`, `/grow`, `/community`, `/about`, `/gccm`, `/search`, `/ask`, `/journey`, `/account`, `/auth`, `/api`, `/legal`, `/admin`.

The V1 experience-layer journeys live at `/start/{faith,questions,difficult-season,grow,stories,companionship}` and the same paths under `/en`. These identifiers guide discovery only; they are not taxonomy values or relationship-state labels. Their canonical contract is [`journeys.yaml`](../../config/architecture/journeys.yaml).

Approved children:

- Library: `/library/{bible,gospel,theology,formation,discipleship,prayer,marriage,family,grief,work-money,leadership,church,mission,culture,education,technology,research}`
- Stories: `/stories/{my-journey,faith,ministry,suffering-grace,little-wheat,family,immigration,learning,testimonies}`
- Companionship: `/together/{talk,faith,life,marriage-family,parenting,grief,spiritual-growth,ministry,prayer,mentor,how-it-works}`
- Growth: `/grow/{explore,believe,abide,serve,lead,multiply}` and potential canonical `/grow/path/[slug]`
- Community: `/community/{groups,prayer,discussions,events,cohorts,mentor-groups,serve}` (advanced functions V2)
- About: `/about/{paul,story,calling,ministry,education,beliefs,projects,contact,support}`
- GCCM: `/gccm/{vision,mission,disciple-making,digital-mission,leadership,church-partners,resources,serve,join}`
- Journey: `/journey/{reading,saved,growth,reflections,rule-of-life,prayer,community,mentor,next-step}` (primarily V1.5+)

Individual content uses stable canonical slugs. Navigation labels are independent of route paths. Folder/route location is never the source of truth for taxonomy. Route removal or semantic changes require redirects, versioning review, and an ADR.

Content Works use `/stories/[work-slug]` for the localized work landing and `/stories/[work-slug]/[unit-slug]` for localized units. English mirrors both beneath `/en`. Route resolution uses canonical work/unit relationships and public publication boundaries; it never infers unit order from paths or filenames. See [ADR-0013](../adr/0013-content-work-ordered-unit-model.md).
