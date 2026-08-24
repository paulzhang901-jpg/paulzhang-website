# Privacy and Consent Model

Separate data domains: anonymous analytics, functional session data, communication consent, contact identity, authenticated account, companionship submissions, prayer requests, growth/reflection data, and mentor data. Never merge them into an undifferentiated metadata blob.

```yaml
ConsentRecord:
  subject_id: scoped identity
  consent_type: essential | analytics | email | personalization | community
  status: granted | denied | withdrawn
  captured_at: timestamp
  source: capture context
  policy_version: applicable policy
```

Email requires a voluntarily supplied address and appropriate opt-in. A ten-minute visit cannot generate or infer email consent.

Prayer, grief, marriage, family, faith, and accompaniment submissions may be sensitive. Restrict access, minimize logging, exclude raw text from analytics/client logs, never automatically send it to AI, and define retention before scale. AI processing requires a reviewed architecture decision and explicit lawful/ethical handling.

No vendor, retention duration, or storage provider is selected here. See [ADR-0010](../adr/0010-privacy-and-consent.md), [Events](./EVENT_SCHEMA.md), and [AI Boundaries](./AI_BOUNDARIES.md).
