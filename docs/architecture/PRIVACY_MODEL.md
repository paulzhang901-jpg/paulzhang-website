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

GA4 is the selected V1 provider for anonymous website analytics only, and it loads only after explicit analytics consent. The consent decision is scoped to analytics and stored first-party; raw sensitive text and identity fields remain excluded. Provider-specific custom events require review against the canonical event registry. See [ADR-0027](../adr/0027-consent-gated-ga4-analytics.md).

No retention duration is selected here. See [ADR-0010](../adr/0010-privacy-and-consent.md), [Events](./EVENT_SCHEMA.md), and [AI Boundaries](./AI_BOUNDARIES.md).

## Local editorial uploads

[ADR-0044](../adr/0044-local-publishing-studio.md) authorizes a loopback-only editorial workspace with same-origin/Host checks and local session/CSRF protection. Original uploads, job history and credentials remain outside public assets and Git; browser responses contain no secrets. Only approved article data needed for the bounded task may reach the authorized Codex executor; unrelated vault material and sensitive ministry submissions are excluded. No generic analytics or raw private logs. Approval records bind article hashes and public destination; upload alone is not publication consent. Retention and owner-controlled cleanup must be specified before implementation acceptance; this decision grants no automatic deletion authority.
