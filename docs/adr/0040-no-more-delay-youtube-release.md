# ADR-0040 — The Day of No More Delay: exact bilingual YouTube release

Status: Accepted by owner in the instruction to continue PR #102 under ADR-0040 and complete final publication. Protected video preview/iPhone acceptance and exact-final-head GitHub approval remain mandatory.
Date: 2026-10-27
Owner: Paul Zhang
Classification: ARCHITECTURE CHANGE
Version boundary: V1; only the existing canonical sermon `sermon-revelation-10-5-7` in zh-CN and en-US.

## Goal and verified assets

Connect the existing bilingual sermon readers to its owner-authorized videos, while retaining the complete approved manuscripts, existing MP3 players/downloads, and existing paths into discipleship and human relationship.

The owner explicitly authorized upload and Public visibility on the existing channel @PaulZhang-j2w. Chrome showed this handle, owner management controls and channel ID `UCij02113c9lnl5oZeRKbE6Q` before upload. Both original Phase 3 MP4 files were selected directly, without regeneration or alteration. YouTube metadata identifies the sermon, Revelation 10:5–7, Paul Zhang, October 25, 2026 and the corresponding website article. The descriptions and platform label disclose AI narration/slides rather than live preaching footage. No reviewed subtitle file is claimed.

| Locale | Exact video ID / public watch URL | Existing article |
| --- | --- | --- |
| zh-CN | [KQ6jdIFjB8c](https://www.youtube.com/watch?v=KQ6jdIFjB8c) | `/library/the-day-of-no-more-delay` |
| en-US | [q8q67bsI3t0](https://www.youtube.com/watch?v=q8q67bsI3t0) | `/en/library/the-day-of-no-more-delay` |

The public watch pages resolve to Paul Zhang / @PaulZhang-j2w. Public browser playback verification is recorded separately. Public YouTube uploads are independent of a protected website preview: Access cannot make those uploads private.

## Conflict and chosen approach

ADR-0038 permits only the exact Chinese Still Unrepentant video. ADR-0034 excludes general YouTube embedding; ADR-0037's ordinary article-video package requires independent bilingual media. Existing code deliberately rejects additional YouTube bindings.

Accepted bounded approach: extend the existing explicit allowlist by exactly these two canonical-ID/locale/video-ID/channel tuples, keeping ADR-0038's original tuple intact. Reuse the existing visitor-activated privacy-enhanced player with localized disclosure and a descriptive title. Do not create another player, arbitrary-provider configuration, new service or route. Direct MP4 hosting is excluded by the owner's instructions and would exceed existing media budgets. A plain external link would not fulfill the requested embedded experience.

## Bounded decision

1. Permit only the two exact tuples above on channel `UCij02113c9lnl5oZeRKbE6Q`. No general YouTube authorization, additional sermon or independent locale inference.
2. Reuse canonical sermon identity/body/source-hash resolution and the existing video catalog, resolver and player. Add corresponding language video to each existing article using the current article media presentation point; retain existing video listing/detail projection if the established resolver exposes it. Do not duplicate or edit article content.
3. Keep iframe creation behind explicit visitor activation; no iframe, external thumbnail, tracking or autoplay before activation. Use only `https://www.youtube-nocookie.com/embed/<approved-ID>`, responsive existing styling, accessible localized title, keyboard/fullscreen support and watch-on-YouTube fallback. Privacy-enhanced mode still makes a third-party connection after activation.
4. Declare actual caption availability truthfully. Do not invent subtitles, local MP4 download links or video storage. All existing MP3 playback/download bindings remain unchanged.
5. Preserve existing CSP/frame-origin restrictions; no broader origin, wildcard, runtime backend, analytics/event, credential, hosting or media-budget change. The public repository contains references/evidence only, never either MP4.
6. Preserve required independent technical/security review, architecture/application/content/security CI and aggregate validation, protected preview with anonymous Access denial, owner actual iPhone Safari playback/pause/fullscreen/navigation acceptance, human-authored approval of the exact final 40-character PR HEAD, and final production authorization. Existing audio iPhone acceptance does not count as video acceptance.
7. Production uses the normal main-only GitHub Actions workflow under ADR-0021 after the approvals and checks pass. No feature-branch production deployment, self-approval, admin merge or branch protection bypass. Rollback is a normally reviewed revert of these two bindings; preserve YouTube uploads and original masters.

## Delivery contract

Scope/Allowed Paths after owner acceptance: this ADR/index and narrow architecture references; `config/media-publishing/published-videos.json` and relevant existing governance release registry; `src/lib/content/published-videos.ts`; `src/components/content/videos-section.tsx` and `approved-youtube-player.tsx`; the existing article media integration point only if absent; relevant existing validators and focused tests. No manuscript MDX/frontmatter/body, MP3, MP4, unrelated page or infrastructure changes.

Acceptance criteria: exact language mapping and source hashes; only approved channel/tuples accepted; arbitrary IDs/origins and crossed locales rejected; original Still Unrepentant and direct-media records unchanged; no third-party requests before activation; original article text/MP3 bindings byte-identical; owner protected-preview/iPhone acceptance and exact-head GitHub record; required CI/build/static-export success; successful main deployment and live bilingual playback; existing Obsidian records receive the two YouTube links without body changes or duplicate notes.

Tests: focused video catalog/player/article integration tests plus required CI. Reuse prior Phase 3 media QA and PR #101 audio acceptance; do not repeat media production or previous audits.

Analytics impact: none. Privacy impact: the same explicitly disclosed, visitor-activated third-party YouTube connection as ADR-0038, now limited to these two additional tuples. ADR impact: only the stated additional bindings and article presentation, after acceptance; ADR-0037/0038/0039 and all other protections remain in force.

## Approval state

The owner authorized continuing the existing PR #102 under ADR-0040 and final publication after checks on 2026-10-27. This accepts the bounded decision and implementation preparation. The owner explicitly answered “全部通过” for protected preview b2e861de on actual iPhone Safari, including bilingual video activation/playback/pause/fullscreen/locale mapping and original MP3 playback/download. The exact-final-head human GitHub approval remains pending; it is not substituted by chat authorization. This same PR carries the scoped implementation; no additional PR is needed.
