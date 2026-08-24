# User State Machine

Canonical relationship states:

`VISITOR → READER → RETURNING_READER → CONNECTED → GROWTH_SEEKER → PARTICIPANT → COMPANION → DISCIPLE_MAKER`

| Transition | Signal/validation |
|---|---|
| Visitor → Reader | meaningful engagement |
| Reader → Returning Reader | future return |
| Returning Reader → Connected | voluntary connection |
| Connected → Growth Seeker | structured pathway start |
| Growth Seeker → Participant | formation/community participation |
| Participant → Companion | training and human validation required |
| Companion → Disciple-Maker | human/mentor/community confirmation required |

Analytics alone must never cause either final transition. Platform states do not express holiness, salvation, maturity, or worth and must not become a numeric spiritual score.

Transient anonymous engagement states (`new`, `engaged`, `deep_reader`, `returning`, `conversion_eligible`, `suppressed`) are separate session state and never replace the relationship state machine.

See [`journey-states.yaml`](../../config/architecture/journey-states.yaml), [ADR-0005](../adr/0005-user-journey-state-machine.md), and [User Journey](../product/USER_JOURNEY.md).
