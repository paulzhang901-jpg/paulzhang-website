# Together submission Worker

This Worker is intentionally separate from the static Next.js export. It owns only `paulzhang.org/api/together*` and `www.paulzhang.org/api/together*`.

Production prerequisites (owner-controlled; do not commit secrets):
1. In Cloudflare Turnstile, create a Managed widget restricted to `paulzhang.org` and `www.paulzhang.org`. Set its public site key as Worker variable `TURNSTILE_SITE_KEY` and its secret as encrypted Worker secret `TURNSTILE_SECRET_KEY`.
2. Enable Cloudflare Email Service for `paulzhang.org`, onboard the sender domain, and disable Email Preview for this sensitive-intake sender/domain. Add and verify `paulzhang901@gmail.com` as an Email Routing destination.
3. Set Worker variable `TOGETHER_FROM_EMAIL` to an address on the onboarded `paulzhang.org` sender domain. The committed `EMAIL` binding is restricted to the verified destination `paulzhang901@gmail.com`.
4. Deploy this Worker with a dedicated least-privilege Cloudflare credential that can manage this Worker/route. Do not reuse the Pages deployment token unless its scope was deliberately expanded by the owner.

No submission body is stored by the Worker, written to analytics, or logged by application code. The Worker emails the submission directly and returns success only after `EMAIL.send()` resolves.
