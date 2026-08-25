import type { ContentLanguage } from "@/types/content";

export const libraryCopy = {
  "zh-CN": {
    home: "首页",
    eyebrow: "真理资源库",
    title: "在真理中扎根，也把真理带进生活。",
    introduction: "这里不是为了堆积资料，而是帮助你找到清楚、可信、可以继续深入的内容，并在真实生命中作出忠心的回应。",
    browseTitle: "按主题开始探索",
    browseBody: "从你正在思考的问题开始。主题来自全站统一的内容分类，不另建一套目录。",
    resourcesTitle: "全部真理资源",
    resourcesBody: "目前只呈现已经公开发布的规范内容；新的正式内容会在完成编辑与翻译审核后加入。",
    resource: "篇资源",
    resourceSingular: "篇资源",
    empty: "这个主题目前还没有已公开的内容。",
    back: "返回真理资源库",
    backStories: "返回生命故事",
    read: "阅读内容",
    availableIn: "语言",
    published: "发布",
    updated: "更新",
    by: "作者",
    scripture: "经文",
    related: "继续阅读",
    relatedBody: "这些内容与本文共享规范主题、生命需要或成长阶段。",
    translationMissing: "此内容暂时没有可用的英文译本。",
    readEnglish: "阅读英文译本",
    translationOutdated: "译本可能需要更新",
    nextTitle: "接下来",
    nextBody: "你可以继续浏览真理资源，也可以在需要时了解同行。",
    nextBodyStories: "你可以继续阅读生命故事，也可以在需要时了解同行。",
    explore: "浏览更多真理资源",
    exploreStories: "浏览更多生命故事",
    companionship: "了解同行",
  },
  "en-US": {
    home: "Home",
    eyebrow: "Truth Library",
    title: "Rooted in truth, carrying truth into life.",
    introduction: "This library is not here to accumulate material. It helps you find clear, trustworthy resources for deeper study and faithful response in ordinary life.",
    browseTitle: "Explore by topic",
    browseBody: "Begin with the question you are carrying. These topics come from the platform’s canonical taxonomy rather than a separate directory.",
    resourcesTitle: "All truth resources",
    resourcesBody: "Only published canonical resources appear here. New editorial content will be added after review and translation checks are complete.",
    resource: "resources",
    resourceSingular: "resource",
    empty: "No public resources are currently available for this topic.",
    back: "Back to Truth Library",
    backStories: "Back to Life Stories",
    read: "Read resource",
    availableIn: "Languages",
    published: "Published",
    updated: "Updated",
    by: "By",
    scripture: "Scripture",
    related: "Continue reading",
    relatedBody: "These resources share canonical topics, life needs, or formation stages with this piece.",
    translationMissing: "An English translation is not currently available.",
    readEnglish: "Read the Chinese edition",
    translationOutdated: "Translation may need updating",
    nextTitle: "A faithful next step",
    nextBody: "Continue exploring the Truth Library, or learn about companionship when you need someone to walk with you.",
    nextBodyStories: "Continue reading Life Stories, or learn about companionship when you need someone to walk with you.",
    explore: "Explore more truth resources",
    exploreStories: "Explore more life stories",
    companionship: "Explore companionship",
  },
} as const satisfies Record<ContentLanguage, object>;

export const libraryTopicLabels: Record<ContentLanguage, Record<string, string>> = {
  "zh-CN": {
    bible: "圣经",
    gospel: "福音",
    theology: "神学",
    formation: "生命塑造",
    discipleship: "门徒训练",
    prayer: "祷告",
    marriage: "婚姻",
    family: "家庭",
    grief: "哀伤",
    "work-money": "工作与金钱",
    leadership: "领导力",
    church: "教会",
    mission: "宣教",
    culture: "文化",
    education: "教育",
    technology: "科技",
    research: "研究",
  },
  "en-US": {
    bible: "Bible",
    gospel: "Gospel",
    theology: "Theology",
    formation: "Spiritual formation",
    discipleship: "Discipleship",
    prayer: "Prayer",
    marriage: "Marriage",
    family: "Family",
    grief: "Grief",
    "work-money": "Work and money",
    leadership: "Leadership",
    church: "Church",
    mission: "Mission",
    culture: "Culture",
    education: "Education",
    technology: "Technology",
    research: "Research",
  },
};

export const contentTypeLabels: Record<ContentLanguage, Record<string, string>> = {
  "zh-CN": {article: "文章", story: "生命故事", bible_study: "查经", devotional: "灵修", qa: "问答", research: "研究", guide: "指南", resource: "资源", sermon: "讲章"},
  "en-US": {article: "Article", story: "Life story", bible_study: "Bible study", devotional: "Devotional", qa: "Q&A", research: "Research", guide: "Guide", resource: "Resource", sermon: "Sermon"},
};

export function libraryTopicLabel(locale: ContentLanguage, slug: string) {
  return libraryTopicLabels[locale][slug] ?? slug;
}

export function contentTypeLabel(locale: ContentLanguage, type: string) {
  return contentTypeLabels[locale][type] ?? type.replaceAll("_", " ");
}

export function contentTopicLabel(locale: ContentLanguage, topic: string) {
  const collection = topic === "spiritual-formation" ? "formation" : topic;
  return libraryTopicLabels[locale][collection] ?? topic.replaceAll("-", " ");
}
