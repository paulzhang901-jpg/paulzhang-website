/** Two language editions of one book. Public PDFs retain the author's review label. */
export const onePhraseOneStory = {
  zhTitle: "一句英语，一个故事",
  enTitle: "One Phrase, One Story",
  author: "张崇助 Paul Zhang",
  cover: "/images/ebooks/one-phrase-one-story.jpg",
  editions: [
    {language: "zh-CN", label: "中文版", enLabel: "Chinese Edition", pdf: "/ebooks/one-phrase-one-story-chinese-author-review.pdf", pages: 487},
    {language: "en-US", label: "英文版", enLabel: "English Edition", pdf: "/ebooks/one-phrase-one-story-english-author-review.pdf", pages: 424},
  ],
} as const;
