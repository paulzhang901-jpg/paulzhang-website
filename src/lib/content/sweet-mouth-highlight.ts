import release from "../../../config/media-publishing/sweet-mouth-highlight-release.json";

// ADR-0045: this immutable file only; never a general no-CORS option.
export const sweetMouthHighlightUrl = "https://github.com/paulzhang901-jpg/paulzhang-website/releases/download/sermon-sweet-mouth-20261101/4cacb571f183ba4d63f27834a3f4cd75bec5d1bb50315d25e7a6e9720b6cbe8a.mp4";
export function isSweetMouthHighlight(value: {canonicalId: string; locale: string; mp4?: string}) {
  return value.canonicalId === "sermon-revelation-10-8-11" && value.locale === "zh-CN" && value.mp4 === sweetMouthHighlightUrl;
}
export const sweetMouthHighlightSection = release.section;
