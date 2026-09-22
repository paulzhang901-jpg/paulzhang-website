import type {Locale} from "@/config/i18n";

export const aboutSectionIds=["profile","calling","education-ministry","writing-preaching","publishing-media","contact","support"] as const;
export type AboutSectionId=(typeof aboutSectionIds)[number];
type Copy={label:string;summary:string;seoDescription?:string};
const copy:Record<Locale,Record<AboutSectionId,Copy>>={
  "zh-CN":{
    profile:{label:"个人简介",summary:"从这里认识 Paul，以及这个网站所呈现的生命与服事方向。"},
    calling:{label:"我的呼召",summary:"认识塑造这份工作方向的呼召与使命。"},
    "education-ministry":{label:"教育与服事",summary:"了解与学习、装备和服事相关的已验证经历。"},
    "writing-preaching":{label:"写作与讲道",summary:"从文字到讲台，认识 Paul 如何连接圣经真理、真实人生与生命成长。",seoDescription:"认识 Paul Zhang 如何通过写作、讲道与真理分享，连接圣经真理、真实人生与生命成长。"},
    "publishing-media":{label:"出版与媒体",summary:"从小说、文章到信仰分享，找到适合阅读、关注和继续探索的公开渠道。",seoDescription:"了解 Paul Zhang 的出版与媒体渠道，包括牧长客小说作品、微信公众号、PaulZhang.org 信仰与深度内容，以及公开媒体入口。"},
    contact:{label:"联系方式",summary:"通过现有公开渠道关注、联系 Paul，或了解邀请与交流方式。"},
    support:{label:"支持这份工作",summary:"了解支持这份工作的方式，以及相关说明。"},
  },
  "en-US":{
    profile:{label:"Personal Profile",summary:"Meet Paul and the life and ministry direction represented by this website."},
    calling:{label:"My Calling",summary:"Explore the calling and mission that shape the direction of this work."},
    "education-ministry":{label:"Education & Ministry",summary:"Find verified information related to learning, formation, and ministry."},
    "writing-preaching":{label:"Writing & Preaching",summary:"Discover how Paul connects biblical truth with real life through writing, preaching, and reflections on spiritual growth.",seoDescription:"Discover how Paul Zhang connects biblical truth with real life through writing, preaching, and reflections on spiritual growth."},
    "publishing-media":{label:"Publishing & Media",summary:"Find where to read, follow, and continue exploring Paul’s fiction, writing, faith content, and public media.",seoDescription:"Explore Paul Zhang’s publishing and media channels, including Mu Changke fiction, WeChat writing, PaulZhang.org faith content, and public media entry points."},
    contact:{label:"Contact",summary:"Use the established public channels to follow or contact Paul and learn about invitations."},
    support:{label:"Support This Work",summary:"Learn how to support this work and review the related information."},
  },
};
export function getAboutSectionIds(){return [...aboutSectionIds]}
export function isAboutSection(value:string):value is AboutSectionId{return aboutSectionIds.includes(value as AboutSectionId)}
export function aboutSectionCopy(locale:Locale,id:AboutSectionId){return copy[locale][id]}
