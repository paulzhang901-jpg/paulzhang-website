export const locales = ["zh-CN", "en-US"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "zh-CN";

export const messages = {
  "zh-CN": {
    skip: "跳到主要内容",
    siteName: "Paul Zhang 张崇助｜真理、生命成长与同行",
    brandName: "Paul Zhang 张崇助",
    brandDescriptor: "真理 · 生命成长 · 同行",
    siteDescription: "通过圣经真理、真实生命故事、成长资源与关系同行，在信仰和人生中一步一步成长。",
    start: "从这里开始",
    library: "真理资源库",
    stories: "生命故事",
    fiction: "文学创作",
    together: "与你同行",
    grow: "成长路径",
    community: "群体",
    about: "关于",
    gccm: "GCCM",
    search: "搜索",
    privacy: "隐私",
    terms: "使用条款",
    language: "English",
    foundation: "基础页面",
    foundationNote: "此页面目前只建立稳定、可访问的 V1 运行时结构，正式内容将在后续任务中加入。",
    menu: "菜单",
    close: "关闭",
    footer: "以真理建立信任，在关系中一同成长。",
  },
  "en-US": {
    skip: "Skip to main content",
    siteName: "Paul Zhang | Truth, Life Formation, and Companionship",
    brandName: "Paul Zhang 张崇助",
    brandDescriptor: "Truth · Growth · Companionship",
    siteDescription: "Explore biblical truth, real-life stories, formation resources, and thoughtful companionship for growing step by step in faith and life.",
    start: "Start Here",
    library: "Truth Library",
    stories: "Life Stories",
    fiction: "Fiction",
    together: "Walk Together",
    grow: "Growth Pathways",
    community: "Community",
    about: "About",
    gccm: "GCCM",
    search: "Search",
    privacy: "Privacy",
    terms: "Terms",
    language: "中文",
    foundation: "Foundation page",
    foundationNote: "This page establishes an accessible V1 runtime shell. Final editorial content will be added in a later task.",
    menu: "Menu",
    close: "Close",
    footer: "Grounded in truth, growing together through relationship.",
  },
} as const;

export type MessageKey = keyof (typeof messages)["zh-CN"];

export function getMessages(locale: Locale) {
  return messages[locale];
}
