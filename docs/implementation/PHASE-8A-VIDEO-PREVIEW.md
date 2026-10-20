# Knowledge and Wisdom — production release preparation

Status: OWNER AUTHORIZED WITH KNOWN SEEKING LIMITATION / FINAL-HEAD GITHUB ACKNOWLEDGEMENT PENDING / NOT YET PUBLISHED.

The owner explicitly accepted the current seeking limitation and authorized publication of both videos in PHASE 8A — PUBLISH NOW. Previously reported playback, pause/resume, fullscreen, subtitles and display PASS are retained. Device/iOS details were not provided; no further physical-device test is claimed. Seeking remains a known limitation: the protected static preview returned full-file 200 for Range requests and native seeking failed. Investigations are closed at the owner's request. No Range Function, new service, player change or media regeneration is included. The unaccepted ADR amendment was withdrawn.

## Accepted assets and integration

Exact tested originals are bound in config/media-publishing/governed-video-releases.json and added to the existing published-videos catalog, preserving its two existing records. Exactly eight content-addressed files are copied from the already tested private fixture: MP4/SRT/VTT/poster per locale. Article, audio, slides and media masters are unchanged. Source base: b43ca0bd7d0460be6a00aabb1b20c95e2b77bd1f. New tracked media: 35,902,378 bytes. Cumulative public/media size is approximately 130 MiB; local Git loose plus packed object storage before this commit is approximately 214 MiB, below the 256/512 MiB respective policy ceilings. The registry records actual byte sizes/hashes and owner acceptance; this metadata is not an authenticated GitHub approval.

Accepted protected previews: https://d6027be7.paulzhang-website-preview.pages.dev/videos/knowledge-and-wisdom and https://d6027be7.paulzhang-website-preview.pages.dev/en/videos/knowledge-and-wisdom. Cloudflare Access is unchanged. Experimental diagnostic HTML remains outside tracked/public production files and must not enter the production export.

## Remaining release gates

Run final-head blocking checks and independent technical/security review. ADR-0037 step 11 additionally requires a human-authored owner acknowledgement on GitHub identifying the exact final PR head; an agent-authored comment or this chat cannot substitute. No such acknowledgement existed at preparation time. Preserve branch protections; do not self-approve. After acknowledgement and required checks/reviews, normal merge triggers main revalidation and the existing production deployment. Verify both live routes, playback, subtitles and exact download links before claiming published. Verify the existing canonical archive relationship without editing article bodies or creating duplicates.
