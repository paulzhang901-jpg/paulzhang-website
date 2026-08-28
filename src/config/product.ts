import type { Locale } from "./i18n";

export const journeyIds = ["faith", "questions", "difficult-season", "grow", "stories", "companionship"] as const;
export type JourneyId = (typeof journeyIds)[number];

export const featuredContent = {
  truth: "truth-foundation-001",
  story: "life-story-sample-001",
} as const;

const zh = {
  hero: {headline: ["在真理中扎根，", "在生命中成长，", "在同行中前行。"], subtitle: "这里分享信仰、生命与成长，也愿意陪你面对人生中的问题，一起寻找方向，一步一步向前。", identity: "我是张崇助（Paul Zhang），牧者、学习者，也是一个仍在恩典中成长的人。", start: "从这里开始", about: "认识我", alt: "张崇助在户外草地上的照片"},
  trust: {title: "不只是读一些内容，而是走一段成长的路。", items: ["真理给我们根基", "故事让我们看见", "同行帮助我们前行"], closing: "从一个问题、一篇文章或一个故事开始就好。"},
  start: {title: "你今天为什么来到这里？", helper: "你不需要先知道该读什么。选择一个最接近你现在处境的方向，我们从那里开始。", fallback: "这些都不是我现在寻找的 → 浏览全部内容"},
  journeys: {faith: "我想认识基督信仰", questions: "我有一个信仰或圣经问题", "difficult-season": "我正在经历人生中的困难", grow: "我想在生命和信仰中成长", stories: "我想读真实的生命故事", companionship: "我需要有人听我说，也陪我走一段路"},
  entrances: {title: "从一个适合你的入口开始", truth: ["寻找真理", "真理资源库"], stories: ["阅读生命故事", "生命故事"], companionship: ["寻找同行", "与你同行"]},
  featured: {title: "也许今天，可以从这里得到一点帮助。", truth: "真理", story: "故事", unavailable: "这个语言版本的内容正在预备中。"},
  grow: {title: "不只是知道，也开始成长。", body: "真理 → 反思 → 操练 → 生命塑造", cta: "开始一条成长路径"},
  companionship: {title: "有些问题，需要答案；有些路，需要有人同行。", body: "当你愿意，不必独自整理所有问题。这里先提供一个温和、清楚的同行入口。", primary: "了解同行", secondary: "我想先读一些内容", alt: "张崇助在书房的牧养与学习场景"},
  about: {title: "认识与你同行的人", body: "我是张崇助，一位牧者、学习者，也愿意在真实生命里与人同行。这个平台从真理出发，在故事与关系中寻找忠心的下一步。", cta: "认识我的故事", sealAlt: "Paul Zhang 张崇助个人印章"},
  connect: {title: "如果你愿意，我们可以继续同行。", body: "通过微信、视频号、YouTube 或教会网站，选择适合你所在地区的方式继续关注与联系。", action: "查看关注与联系方式"},
  journeyPage: {ack: "你可以按现在的步伐开始，不需要一次读完所有内容。", starting: "三个起步方向", related: "相关真理与故事", reflection: "停下来想一想", reflectionBody: "今天哪一句话、哪个问题最值得你继续思想？", next: "下一步", optional: "如果你愿意，也可以了解同行。", explore: "浏览全部内容"},
  prompts: {fiveTitle: "不必急着读很多。", fiveBody: "如果这里的内容正在帮助你，可以停一下：今天哪一句话、哪个问题最值得你继续思想？", fiveAction: "进入成长与反思", tenTitle: "接下来，你想怎样继续？", return: "以后再回来", connect: "接收新的分享", companionship: "了解同行", dismiss: "关闭提示"},
} as const;

const en = {
  hero: {headline: ["Rooted in Truth.", "Growing in Life.", "Walking Together."], subtitle: "A place to explore faith, life, and growth—and to find thoughtful companionship for the questions and seasons you are walking through.", identity: "I'm Paul Zhang—a pastor, learner, and fellow traveler still growing in grace.", start: "Start Here", about: "My Story", alt: "Paul Zhang outdoors in an open field"},
  trust: {title: "More than reading content—a path of growth.", items: ["Truth gives us a foundation", "Stories help us see", "Companionship helps us move forward"], closing: "Begin with one question, one article, or one story."},
  start: {title: "What brings you here today?", helper: "You don't need to know where to begin. Choose what feels closest to where you are right now, and start there.", fallback: "None of these quite fit → Explore everything"},
  journeys: {faith: "I want to explore the Christian faith", questions: "I have a question about faith or the Bible", "difficult-season": "I'm going through a difficult season", grow: "I want to grow in faith and life", stories: "I want to read real-life stories", companionship: "I need someone to listen and walk with me"},
  entrances: {title: "Begin with an experience that fits", truth: ["Explore Truth", "Truth Library"], stories: ["Read Life Stories", "Life Stories"], companionship: ["Find Companionship", "Walk Together"]},
  featured: {title: "Perhaps something here can help today.", truth: "Truth", story: "Story", unavailable: "This language edition is being prepared."},
  grow: {title: "Not only knowing, but beginning to grow.", body: "Truth → Reflection → Practice → Formation", cta: "Begin a growth pathway"},
  companionship: {title: "Some questions need answers; some roads need companionship.", body: "When you are ready, you do not have to sort through every question alone. Begin with a gentle, clear invitation to walk together.", primary: "Explore Companionship", secondary: "Read first", alt: "Paul Zhang in a pastoral study setting"},
  about: {title: "Meet a fellow traveler", body: "I'm Paul Zhang, a pastor and learner who wants to walk with people in real life. This platform begins with truth and seeks a faithful next step through story and relationship.", cta: "Read my story", sealAlt: "Paul Zhang personal seal"},
  connect: {title: "If you would like, we can keep walking together.", body: "Connect through WeChat, the WeChat Video Channel, YouTube, or the church website using the channels available where you live.", action: "Follow & Connect"},
  journeyPage: {ack: "Begin at your present pace; you do not need to read everything at once.", starting: "Three places to begin", related: "Related truth and story", reflection: "Pause and reflect", reflectionBody: "Which sentence or question is most worth carrying forward today?", next: "Next step", optional: "When you are ready, you can also explore companionship.", explore: "Explore everything"},
  prompts: {fiveTitle: "You do not need to read a lot at once.", fiveBody: "If something here is helping, pause: which sentence or question is most worth carrying forward today?", fiveAction: "Grow and reflect", tenTitle: "How would you like to continue?", return: "Return later", connect: "Stay connected", companionship: "Explore companionship", dismiss: "Dismiss prompt"},
};

export function getProductCopy(locale: Locale) { return locale === "zh-CN" ? zh : en; }

export function journeyPath(id: JourneyId, locale: Locale) { return `${locale === "en-US" ? "/en" : ""}/start/${id}` as const; }
