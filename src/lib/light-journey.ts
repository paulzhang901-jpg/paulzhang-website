import type {Locale} from "@/config/i18n";
export const lightJourneySectionIds=["travel","reflections","culture","faith","society","stories","churches"] as const;
export type LightJourneySectionId=(typeof lightJourneySectionIds)[number];
type Copy={label:string;summary:string};
const copy:Record<Locale,Record<LightJourneySectionId,Copy>>={
 "zh-CN":{
  travel:{label:"旅行见闻",summary:"旅途中关于地方、人与日常的观察入口。"},
  reflections:{label:"黙想与思考",summary:"为旅途中的安静、思想与反省保留空间。"},
  culture:{label:"文化观察",summary:"从旅途中观察不同地方的文化与生活。"},
  faith:{label:"信仰随思",summary:"记录旅途中与信仰有关的思考入口。"},
  society:{label:"社会议题",summary:"关注旅途中所遇见的社会与公共议题。"},
  stories:{label:"照片与故事",summary:"让照片与文字共同承载旅途中的故事。"},
  churches:{label:"世界中的教会",summary:"关注世界不同地方的教会与信仰群体。"},
 },
 "en-US":{
  travel:{label:"Travel Notes",summary:"A place for observations of places, people, and everyday life along the way."},
  reflections:{label:"Quiet Reflections",summary:"Space for stillness, thought, and reflection during the journey."},
  culture:{label:"Cultural Observations",summary:"Observing culture and daily life in different places through travel."},
  faith:{label:"Faith Reflections",summary:"An entry point for reflections on faith encountered along the way."},
  society:{label:"Society & Issues",summary:"Considering social and public issues encountered through the journey."},
  stories:{label:"Photos & Stories",summary:"A place where photographs and words can carry stories from the road."},
  churches:{label:"Churches Around the World",summary:"Observing churches and communities of faith in different parts of the world."},
 },
};
export function getLightJourneySectionIds(){return [...lightJourneySectionIds]}
export function isLightJourneySection(value:string):value is LightJourneySectionId{return lightJourneySectionIds.includes(value as LightJourneySectionId)}
export function lightJourneySectionCopy(locale:Locale,id:LightJourneySectionId){return copy[locale][id]}
