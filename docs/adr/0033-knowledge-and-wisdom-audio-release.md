# ADR-0033 — Knowledge and Wisdom audio release decision

Status: Accepted — owner explicitly approved the bounded mechanism on 2026-10-17; release gates remain pending
Scope: V1 delivery of existing audio only; ARCHITECTURE CHANGE to the bounded release boundary
Decision owner: Paul Zhang
Architecture references: ADR-0032, ADR-0021; existing static deployment contract

## Goal and scope
Bind the two completed, existing Voicebox MP3s to canonical ID `article-knowledge-and-wisdom-2026-10-03`, existing Chinese and English article routes, and the existing audio player/download controls. Preserve the canonical MDX bytes and all original audio. No generation, redesign, new hosting resources, paid services or branch-protection changes.

Owner instruction: “The owner has listened to and approved the English audio”; “Publish both”; “Follow ADR-0032 and all required checks.” This records the owner's English listening approval and publication request as separate statements. It does not claim protected-preview acceptance, an authenticated production-governance transition or an independent technical review. Chinese recording approval is carried from the existing approved recording checkpoint and must be bound to the exact hash below during release review.

## Exact candidate identity

Source commit: `ea1198b78bd1445d8174110f7e466cb8b2102321`.
Source hash policy: SHA-256 of exact repository MDX bytes. Audio hash policy: SHA-256 of existing MP3 bytes.

| Locale | Audio SHA-256 | Bytes | Source MDX SHA-256 |
|---|---|---|---|
| zh-CN | `829c386e3dffc92194d2c020ac2a4bd3874671e15e79fa741c8f56fbfeb3edc1` | 11128915 | `5638b8690fdff7f2bcc3089e71f76348af50c4e127c5ae14eeec6c34b9821549` |
| en-US | `735b3eee7cbea8f37127ea7c0eafd292d00e4a02194e1fdfdfc88ee64c74a8f6` | 14074412 | `09f556892b33ce51696323ac398be0657454d671284ead7d2f4f53200007c28f` |

English technical evidence: 39 preserved ordered segments; generation inputs cover the entire approved article; full decode passed; duration 879.5605 seconds; full-article automatic transcription similarity 96.7%. Automated comparison is not human listening. No candidate audio is included in this documentation PR or exposed at a public URL.

## Accepted bounded decision
For only these exact candidates and source hashes, permit a reviewed GitHub release record to serve as the owner identity/provenance and retained release-decision record instead of activating the unimplemented production administration service. The owner explicitly approved this ADR's mechanism in the “OWNER APPROVAL — PR #88” instruction on 2026-10-17. This acceptance is limited to the exact candidates below and does not assert iPhone acceptance. The separate sermon exception is not reused.

Retain separate listening and publication acts, all source/voice/audio bindings, independent technical review, the required PR validation, protected merge, main revalidation/deployment and reviewed rollback. No generic publishing function is enabled. Before implementation, after owner acceptance, update the affected architecture documents and exact-asset registry/schema constraints. Unknown historical Chinese generation settings must remain explicitly unknown.

Protected preview and actual iPhone acceptance remain mandatory before production. No exemption or deferral is proposed. The existing workflow deploys only main to production and provides no protected preview URL for this article. Select and approve a protected preview delivery mechanism before uploading candidate media; never substitute an unprotected Pages preview, public PR attachment, public Git asset or production deployment for private candidate review. No new infrastructure is created by this ADR.

## Acceptance and iPhone checklist
Record the protected preview URL, exact source/audio hashes and reviewer identity/time. On an actual iPhone record model, iOS and browser. For both locale article pages: verify audible playback, pause/resume, seeking, speed, correct language, download, and playback of the downloaded MP3. Verify no competing narration engines. Browser events alone do not establish audibility. Keep the real owner result separate from automated tests.

After those gates: use the existing player and exact immutable MP3 bindings in one scoped release PR; run content, translation, architecture, application, security and static-export validation; obtain independent technical review; merge only after required checks and publication authorization. Let the existing main GitHub Actions job deploy. Verify both production article players, byte-identical downloads and range delivery. Verify the existing canonical Obsidian archive relationship without duplicating or editing article bodies.

## Allowed paths and impacts
Approval record changes: this ADR, ADR index, release-boundary architecture note and non-runtime candidate binding evidence. Future implementation, after acceptance: exact release provenance, exact catalog bindings, two hash-named assets, exact-asset budget checks and focused tests. Article MDX, routes, player design, analytics, privacy boundaries, hosting and workflows remain unchanged. No new analytics or private-data logging. Rollback uses a reviewed removal/revert of publication bindings while retaining original recordings.

## Current blockers
Approved protected preview mechanism and real iPhone results; independently reviewed release provenance and required checks. Production remains NOT PUBLISHED. No preview URL exists yet. Do not invent one or mark these items complete.

## Candidate audio-to-player evidence
The owner subsequently states both completed MP3 files are approved. Exact candidate mappings, article routes, source/presentation/audio hashes, byte counts and the existing player/download path are recorded in [candidate bindings](../implementation/knowledge-and-wisdom-audio-candidate-bindings.json). These records are review evidence only; they are not loaded by the website. Both playback and download would use the same immutable locale-specific MP3 URL. No MP3 bytes have been uploaded and no runtime catalog mapping is activated.

Owner decision recorded: the direct “OWNER APPROVAL — PR #88” instruction explicitly accepts the GitHub release-record mechanism for these approved Chinese and English MP3s. This is separate from the already recorded audio listening approval. Protected preview setup and actual iPhone acceptance remain pending. The owner explicitly requires branch protection and successful iPhone acceptance before merge/deploy.

## Owner approval record — 2026-10-17
Direct instruction: “I explicitly approve the proposed ADR-0033 GitHub release-record mechanism for the approved Chinese and English MP3 files of \"The Difference Between Knowledge and Wisdom\".” Recorded by Codex as the owner's execution agent. This is a conversation-sourced approval, not a fabricated GitHub review or protected-preview result. PR may now be marked ready for technical review; production remains blocked until the remaining gates pass.

## Protected preview checkpoint
The existing Cloudflare Pages account login is available, but the Access API returned HTTP 403 `access.api.error.not_enabled`. Access is not enabled for this account; there is no protected preview URL. Owner action: enable Access and the existing Pages project's preview access policy in Cloudflare, allowing owner access. Do not upload candidate MP3s before verifying anonymous denial on preview URLs. No production domain policy is to be changed.
