# ADR-0023 — Together Secure Submission Delivery
Status: Accepted
Date: 2026-09-20

## Context
ADR-0022 deliberately separated Together participation from content publication. The owner has now verified a production Cloudflare Worker at `https://paulzhang-together.paulzhang901.workers.dev/`: a real JSON POST returned HTTP 200 and delivered a real email from `together@paulzhang.org` to the verified destination `paulzhang901@gmail.com`. The deployed Worker accepts `name`, `email`, `phone`, `subject`, `message`, `language`, and `page`. Cloudflare Email Service binding `EMAIL` and `TOGETHER_FROM_EMAIL=together@paulzhang.org` are configured in production.

## Decision
Keep the Next.js site as a static export. The five participation forms POST JSON directly to the verified Cloudflare Worker endpoint. Section-specific details and conservative sharing/publication permissions are serialized into the private email message while the seven-field Worker contract remains unchanged. Success is shown only after the Worker returns an HTTP success status.

The deployed Worker, not this static repository, owns server-side email delivery and validation. No mail/API secret is present in browser code. No submission is converted into Markdown, committed to GitHub, or automatically published. Prayer-team sharing, public prayer sharing, testimony follow-up, and testimony publication remain unchecked by default.

Turnstile is not part of the verified production Worker contract supplied by the owner, so the static client does not invent a Turnstile dependency or keys. If bot protection is later added to the deployed Worker, its client contract must first be verified and this ADR updated.

## CORS requirement
Because the browser posts cross-origin to the `workers.dev` endpoint, the deployed Worker must allow `POST`/`OPTIONS`, `Content-Type`, and the origins `https://paulzhang.org` and `https://www.paulzhang.org`. This is a production Worker configuration/runtime requirement and cannot be guaranteed by static-site repository code. Live verification on 2026-09-20 confirmed the apex origin works; the www request currently receives `Access-Control-Allow-Origin: https://paulzhang.org`, so www remains an owner-side Worker fix.

## Supersedes
This updates ADR-0023's earlier proposed same-origin `/api/together` Worker/Turnstile design to match the owner-verified deployed Worker. ADR-0022's seven-section taxonomy and Markdown publishing architecture remain unchanged.
