// Exact owner-scoped official-channel references. No arbitrary video URL input.
export const approvedYoutubeVideos = {
  "0J44f6acTeQ": {canonicalId: "sermon-revelation-9-20-21", locale: "zh-CN", title: "仍旧不悔改"},
  "PkAcmwSGzkE": {referenceId: "official-hymn-this-is-my-story", locale: "en-US", title: "This is my story, this is my song, praising my Saviour all the day long;", slug: "this-is-my-story"},
  "RPMMeUapK-E": {referenceId: "official-paul-zhang-biography", locale: "zh-CN", title: "张崇助牧师的履历简介", slug: "paul-zhang-biography", related: "/about/profile"},
} as const;
export type ApprovedYoutubeVideoId = keyof typeof approvedYoutubeVideos;
export const officialYoutubeChannel = "UCij02113c9lnl5oZeRKbE6Q";
