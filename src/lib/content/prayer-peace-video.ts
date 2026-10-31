import release from "../../../config/media-publishing/prayer-peace-direct-release.json";

// Exact ADR-0043 capability: never a general external-player/no-CORS switch.
export function isPrayerPeaceDirectVideo(value: {canonicalId: string; locale: string; mp4?: string}) {
  return value.canonicalId === "video-sermon-prayer-peace" && value.locale === "zh-CN" &&
    value.mp4 === release.media.url;
}
export const prayerPeaceDirectUrl = release.media.url;
