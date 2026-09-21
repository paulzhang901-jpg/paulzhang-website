# ADR-0023 — Together Secure Submission Delivery
Status: Accepted
Date: 2026-09-20

## Context
ADR-0022 deliberately stopped at a human handoff because no secure submission backend or verified recipient existed. The owner has now confirmed `paulzhang901@gmail.com` as the canonical recipient for Mentoring, Prayer Support, Growth Groups, Contact, and Testimony Sharing. The public site must remain a Next.js static export on Cloudflare Pages; prayer, mentoring, and testimony text must not enter GitHub, analytics, or public logs.

## Decision
Keep the existing static Pages application unchanged as the content origin. Add one narrowly routed Cloudflare Worker at `/api/together*`; it does not serve or proxy any other site URL. The five forms share one client component and one Worker validation/delivery pipeline.

The Worker validates origin, content type, request/body lengths, section/locale enums, required fields, email shape, permission booleans, and Cloudflare Turnstile server-side before delivery. It sends directly to the fixed recipient through a Cloudflare Email Service `send_email` binding restricted to `paulzhang901@gmail.com`. User-supplied fields are message-body data, not email headers. Application code does not persist or log submission bodies.

Turnstile keys and the sender address are runtime Worker configuration. The Turnstile secret is encrypted. Production must use a real hostname-restricted Turnstile widget; Cloudflare testing credentials are test-only. Email Service must have a verified destination and an onboarded sender domain. Email Preview must be disabled for this sensitive-intake sender/domain so message bodies are not retained in Cloudflare's email preview feature.

The browser first reads `/api/together` for readiness and the public Turnstile site key. If runtime delivery is not configured, the UI truthfully reports that online submission is unavailable. POST success is displayed only after Turnstile validation and `EMAIL.send()` resolve successfully.

Prayer-team sharing, public prayer sharing, testimony follow-up, and testimony publication are explicit booleans and default to false. A visitor submission is private intake only: it is never converted to Markdown and never automatically published.

## Alternatives Considered
Converting Next.js away from static export, a client-side mail service, a fake form, GitHub-backed intake, Pages Functions plus a second service, and reusing the Pages deployment API token were rejected. A narrowly routed Worker preserves the static site, keeps secrets server-side, and uses the existing Cloudflare platform without adding an unrelated vendor.

## Operational prerequisite
No production Worker is deployed by this ADR. The owner must complete Cloudflare Email Service/Turnstile configuration and authorize a dedicated Worker deployment credential/route before end-to-end production delivery can be verified.

## Supersedes
ADR-0022's temporary human-handoff participation mechanism only. ADR-0022's seven-section content taxonomy and Markdown publishing architecture remain unchanged.
