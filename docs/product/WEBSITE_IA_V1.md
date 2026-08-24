# Website Information Architecture v1

Approved top-level IA: **HOME · TRUTH LIBRARY · LIFE STORIES · COMPANIONSHIP · GROWTH PATHWAYS · COMMUNITY · ABOUT · GCCM · MY JOURNEY**.

```text
/
├── /start
├── /library
├── /stories
├── /together
├── /grow
├── /community
├── /about
├── /gccm
├── /search
├── /ask
└── /journey
```

| Section | Purpose | Entry state | Primary need | Desired next state | CTA category | Scope |
|---|---|---|---|---|---|---|
| Home `/` | Orient and offer a faithful next step | Visitor | clarity | Reader | start/explore | V1 |
| Start `/start` | Intent-led entry | Visitor | relevance | Reader | selected intent | V1 |
| Library `/library` | Trusted truth resources | Visitor/Reader | truth/learning | Returning Reader | read/save/continue | V1 |
| Stories `/stories` | Build trust through authentic life | Visitor/Reader | identification/hope | Returning Reader | related story/companionship | V1 |
| Together `/together` | Voluntary human connection | Reader/Returning Reader | relationship/prayer | Connected | request/contact | V1 entry |
| Grow `/grow` | Explain formation pathways | Connected | structured growth | Growth Seeker | start pathway | V1 landing; V1.5 structured |
| Community `/community` | Belonging and participation | Growth Seeker | belonging | Participant | learn/join | V1 landing; V2 functions |
| About `/about` | Identity, beliefs, calling, accountability | Visitor/Reader | trust/context | Returning Reader | explore/contact | V1 |
| GCCM `/gccm` | Mission and multiplication destination | Participant+ | mission/service | Companion | serve/join | V1 landing; V2 integration |
| Search `/search` | Find relevant canonical content | Reader | discovery | Reader/Returning Reader | open result | V1 |
| Ask `/ask` | Reserved AI-assisted navigation | Connected | guided discovery | Growth Seeker/human handoff | retrieve/connect | Future |
| My Journey `/journey` | Private continuity and formation | Connected+ | continuity | Growth Seeker/Participant | resume/reflect | V1.5+ |

GCCM must not be the default first-time entry. Navigation labels may change without changing stable route semantics. See [Route Schema](../architecture/ROUTE_SCHEMA.md) and [routes registry](../../config/architecture/routes.yaml).
