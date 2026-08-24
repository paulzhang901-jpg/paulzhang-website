# Event and Conversion Architecture

Canonical events use `domain.object.action` where useful, or the approved two-segment equivalent such as `content.viewed`. No uncontrolled names (`buttonClicked2`, `popupEvent`, `trackThing`). The registry is [`events.yaml`](../../config/architecture/events.yaml); see [ADR-0006](../adr/0006-engagement-event-model.md).

Conceptual envelope:

```yaml
event_id: unique id
event_name: registered name
event_version: positive integer
occurred_at: timestamp
session_id: optional pseudonymous id
anonymous_id: optional pseudonymous id
user_id: optional account id
route: optional route
content_id: optional canonical content id
language: optional locale
properties: event-specific non-sensitive values
```

Not every field is required. Raw pastoral, prayer, grief, marriage, family, counseling, or companionship text must never enter event properties.

## Conversion levels

- C1 Discovery: Visitor → Reader
- C2 Trust: Reader → Returning Reader
- C3 Relationship: Reader/Returning Reader → Connected through voluntary confirmed subscription, contact, prayer, or companionship request
- C4 Formation: Connected → Growth Seeker through `growth_path.started`
- C5 Participation: Growth Seeker → Participant (mostly V1.5/V2)
- C6 Multiplication: Participant → Companion → Disciple-Maker (V2, human validated)

## Encouragement engine

After about five minutes of **active meaningful reading**, gentle encouragement may appear without demanding email. At ten minutes, two meaningful reads, or a return visit, a relational “continue the journey” invitation may be eligible. Centralized policy must support dismissal, session suppression, frequency caps, subscription-aware suppression, and authenticated-user suppression.

Browser-tab-open time is not meaningful reading. Future algorithms should consider visibility, activity, scroll/read interaction, and idle state. Do not register or emit unused events merely to inflate telemetry.
