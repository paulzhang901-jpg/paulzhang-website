import type {ContentLanguage} from "@/types/content";

export const communitySectionIds=["church","sunday","groups","choir","youth","care","join"] as const;
export type CommunitySectionId=(typeof communitySectionIds)[number];

type Copy={label:string;summary:string;seoTitle?:string;seoDescription?:string};
const sectionCopy:Record<ContentLanguage,Record<CommunitySectionId,Copy>>={
  "zh-CN":{
    church:{label:"教会介绍（FCFMC）",seoTitle:"印城第一华人循理会",summary:"认识 The First Chinese Free Methodist Church of Indianapolis（FCFMC）的信仰传统、属灵归属、当前聚会地点与未来方向。",seoDescription:"认识印城第一华人循理会（FCFMC）：我们的卫斯理宗与循理会传统、Crossroads Conference 归属、Greenfield 当前聚会地点及教会网络入口。"},
    sunday:{label:"主日信息与活动",seoTitle:"主日敬拜与活动 | 印城第一华人循理会",summary:"从这里了解主日敬拜与群体活动的公开信息。",seoDescription:"了解 FCFMC 每周日 12:30 PM 在 Greenfield, Indiana 的主日敬拜、本周讲道与每周聚会信息。"},
    groups:{label:"小组与团契",summary:"在更小的群体中彼此认识、分享，并一起成长。"},
    choir:{label:"诗班与服事",summary:"认识诗班与服事生活，并寻找合适的参与方向。"},
    youth:{label:"青年与下一代",summary:"关注青年与下一代在信仰、关系和生命中的成长。"},
    care:{label:"社区关怀",summary:"以实际的关怀连接邻舍，在社区中彼此扶持。"},
    join:{label:"加入我们",summary:"了解如何进一步认识这个群体，并找到合适的下一步。"},
  },
  "en-US":{
    church:{label:"Church Introduction",seoTitle:"The First Chinese Free Methodist Church of Indianapolis",summary:"Meet FCFMC through our Free Methodist heritage, conference connection, current gathering place, and direction for the future.",seoDescription:"Meet The First Chinese Free Methodist Church of Indianapolis (FCFMC), including our Wesleyan and Free Methodist heritage, Crossroads Conference connection, current Greenfield gathering location, and official church links."},
    sunday:{label:"Sunday Worship & Events",seoTitle:"Sunday Worship & Activities | The First Chinese Free Methodist Church of Indianapolis",summary:"Find public information about Sunday worship and community events here.",seoDescription:"Find FCFMC Sunday worship at 12:30 PM in Greenfield, Indiana, along with this week’s sermon and weekly gathering information."},
    groups:{label:"Groups & Fellowship",summary:"Build relationships, share life, and grow together in smaller communities."},
    choir:{label:"Choir & Serving",summary:"Explore choir and serving life and find an appropriate way to participate."},
    youth:{label:"Youth & Next Generation",summary:"Support the next generation as they grow in faith, relationships, and life."},
    care:{label:"Community Care",summary:"Connect with neighbors through practical care and mutual support."},
    join:{label:"Join Us",summary:"Learn how to get to know this community and find an appropriate next step."},
  },
};
export function getCommunitySectionIds(){return [...communitySectionIds]}
export function isCommunitySection(value:string):value is CommunitySectionId{return communitySectionIds.includes(value as CommunitySectionId)}
export function communitySectionCopy(locale:ContentLanguage,id:CommunitySectionId){return sectionCopy[locale][id]}
