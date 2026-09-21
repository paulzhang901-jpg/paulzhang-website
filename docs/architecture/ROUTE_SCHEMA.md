# Route Schema

Machine source: [`config/architecture/routes.yaml`](../../config/architecture/routes.yaml). Decision: [ADR-0002](../adr/0002-route-architecture.md).

Locale routing follows [ADR-0011](../adr/0011-locale-url-strategy.md): `zh-CN` uses the canonical unprefixed routes, while `en-US` mirrors approved public routes beneath `/en`. `/zh` is not allowed. Locale prefixing does not create a second domain or taxonomy tree.

Reserved top-level namespaces: `/`, `/start`, `/library`, `/stories`, `/fiction`, `/together`, `/grow`, `/community`, `/about`, `/gccm`, `/search`, `/ask`, `/journey`, `/account`, `/auth`, `/api`, `/legal`, `/admin`.

The V1 experience-layer journeys live at `/start/{faith,questions,difficult-season,grow,stories,companionship}` and the same paths under `/en`. These identifiers guide discovery only; they are not taxonomy values or relationship-state labels. Their canonical contract is [`journeys.yaml`](../../config/architecture/journeys.yaml).

Approved children:

- Library: `/library/{bible,gospel,theology,formation,discipleship,prayer,marriage,family,grief,work-money,leadership,church,mission,culture,education,technology,research}`
- Stories: `/stories/{my-journey,faith,ministry,suffering-grace,little-wheat,family,immigration,learning,testimonies}`
- Together: `/together/{mentoring,prayer-support,growth-groups,faq,contact,testimonies,resources}`. Former companionship slugs remain legacy aliases for URL compatibility but are not permanent section identities. See [ADR-0022](../adr/0022-together-content-and-participation-architecture.md).
- Growth: `/grow/{explore,believe,abide,serve,lead,multiply}` and potential canonical `/grow/path/[slug]`
- Community: `/community/{church,sunday,groups,choir,youth,care,join}`. These seven bilingual navigation categories are permanent V1 architecture; future verified content belongs inside them. See [ADR-0024](../adr/0024-community-permanent-v1-architecture.md).
- About: `/about/{profile,calling,education-ministry,writing-preaching,publishing-media,contact,support}`. Contact and Support retain their existing canonical content and functionality as permanent sections 06–07. See [ADR-0025](../adr/0025-about-permanent-v1-architecture.md).
- GCCM: `/gccm/{vision,mission,disciple-making,digital-mission,leadership,church-partners,resources,serve,join}`
- Journey: `/journey/{reading,saved,growth,reflections,rule-of-life,prayer,community,mentor,next-step}` (primarily V1.5+)

Individual content uses stable canonical slugs. Navigation labels are independent of route paths. Folder/route location is never the source of truth for taxonomy. Route removal or semantic changes require redirects, versioning review, and an ADR.

Content Works use `/stories/[work-slug]` for the localized work landing and `/stories/[work-slug]/[unit-slug]` for localized units. English mirrors both beneath `/en`. Route resolution uses canonical work/unit relationships and public publication boundaries; it never infers unit order from paths or filenames. See [ADR-0013](../adr/0013-content-work-ordered-unit-model.md).

Mu Changke Fiction uses `/fiction` for its approved author portfolio and `/fiction/[slug]` for individual work-discovery records. English mirrors these beneath `/en`. No chapter, read, manuscript, contract, or download child route is permitted. The route consumes LOCKED editorial packages and verified cover mappings only. See [ADR-0014](../adr/0014-mu-changke-fiction-portfolio-route.md).
