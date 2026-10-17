# Existing bilingual sermon audio release

Owner: Paul Zhang / GitHub subject paulzhang901-jpg.
Architecture classification: bounded owner-authorized exception to ADR-0032; see that ADR's 2026-10-17 exception. Goal: connect the existing approved MP3s and tested player to the two existing sermon pages. Scope: those two locale bindings, player integration, immutable assets, CI and provenance records only.

Authorization source: the owner's explicit instruction headed “PRIORITY: PUBLISH THE COMPLETED SERMON AUDIO”, including “I am the website owner and authorize an expedited release”, reuse the approved files/player, document the minimum exception, preserve protection, and merge/deploy after required checks. The owner subsequently instructed continuing the upload, PR and deployment. This record is maintained by Codex acting under that authority, not a claim of an independent human review.

Separate owner acts: both completed recordings were personally listened to and approved; both local players were personally accepted; the later expedited instruction authorizes publication. Asset/source/voice identity is fixed in config/media-publishing/releases/sermon-revelation-9-20-21.json, using source commit 34d1aee630b34ef631c4d5419ae5c8f96f9b4f8f. The original manuscripts and MP3s are unchanged.

For this one release the owner-directed exception defers protected preview and actual iPhone verification until after deployment. Mac acceptance is not proof of actual iPhone behavior. Legacy profile/model descriptors are retained; unknown historical generation settings are not invented. This does not authorize more generation, future audio releases, new hosting resources or paid services.

Delivery: HTML5 MP3 is preferred only for a matching source/locale publication entry; existing browser synthesis remains fallback. One narration engine at a time, no autoplay, local synthetic-voice disclosure, seeking, speed and download. No route/content/metadata/SEO changes. No new analytics or private-data logging.

Before merge: verify exact transferred MP3 bytes, both canonical MDX hashes, presentation hashes and release bindings through the existing content-integrity tests; obtain independent technical review and successful GitHub Actions validate. Do not bypass rulesets. Merge and deploy only through the existing main workflow.

After deployment: verify both public pages show the AI player, both MP3 URLs return the approved bytes, and seeking/range delivery works. Owner performs real-iPhone playback/download verification afterward; retain that result separately.

Rollback: use a reviewed revert of the two publication entries/player integration if delivery fails; preserve the original recordings and canonical manuscripts. The empty or stale catalog restores browser fallback. No destructive deletion of original audio is authorized.
