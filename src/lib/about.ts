import type {Locale} from "@/config/i18n";

export const aboutSectionIds=["profile","calling","education-ministry","writing-preaching","publishing-media","contact","support"] as const;
export type AboutSectionId=(typeof aboutSectionIds)[number];
type Copy={label:string;summary:string};
const copy:Record<Locale,Record<AboutSectionId,Copy>>={
  "zh-CN":{
    profile:{label:"个人简介",summary:"从这里认识 Paul，以及这个网站所呈现的生命与服事方向。"},
    calling:{label:"我的呼召",summary:"认识塑造这份工作方向的呼召与使命。"},
    "education-ministry":{label:"教育与服事",summary:"了解与学习、装备和服事相关的已验证经历。"},
    "writing-preaching":{label:"写作与讲道",summary:"认识 Paul 在写作、讲道与真理分享上的工作。"},
    "publishing-media":{label:"出版与媒体",summary:"从这里进入与出版、内容和媒体相关的公开工作。"},
    contact:{label:"联系方式",summary:"通过现有公开渠道关注、联系 Paul，或了解邀请与交流方式。"},
    support:{label:"支持这份工作",summary:"了解支持这份工作的方式，以及相关说明。"},
  },
  "en-US":{
    profile:{label:"Profile",summary:"Meet Paul and the life and ministry direction represented by this website."},
    calling:{label:"Calling",summary:"Explore the calling and mission that shape the direction of this work."},
    "education-ministry":{label:"Education & Ministry",summary:"Find verified information related to learning, formation, and ministry."},
    "writing-preaching":{label:"Writing & Preaching",summary:"Explore Paul's work in writing, preaching, and sharing biblical truth."},
    "publishing-media":{label:"Publishing & Media",summary:"Enter the public work related to publishing, content, and media."},
    contact:{label:"Contact",summary:"Use the established public channels to follow or contact Paul and learn about invitations."},
    support:{label:"Support This Work",summary:"Learn how to support this work and review the related information."},
  },
};
export function getAboutSectionIds(){return [...aboutSectionIds]}
export function isAboutSection(value:string):value is AboutSectionId{return aboutSectionIds.includes(value as AboutSectionId)}
export function aboutSectionCopy(locale:Locale,id:AboutSectionId){return copy[locale][id]}
