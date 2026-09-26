export const ebooks = [
  {volume: 1, zhTitle: "删不掉的光 I：日子里的恩典", enTitle: "The Light They Could Not Erase, Vol. 1: Grace in Ordinary Days", zhDescription: "在平凡日子、信仰、家庭、服事、苦难与生活经历中寻找恩典的文字合集。", enDescription: "A collection of reflections on grace discovered in ordinary life, faith, family, ministry, suffering, and everyday experience."},
  {volume: 2, zhTitle: "删不掉的光 II：在新时代中守住灵魂", enTitle: "The Light They Could Not Erase, Vol. 2: Keeping the Soul in a Restless Age", zhDescription: "在快速变化、令人不安的时代中，思想如何以信仰、真理、智慧与属灵分辨守住灵魂。", enDescription: "Reflections on keeping the soul grounded in faith, truth, wisdom, and spiritual discernment amid a restless and rapidly changing age."},
  {volume: 3, zhTitle: "删不掉的光 III：在破碎中仍然相爱", enTitle: "The Light They Could Not Erase, Vol. 3: Loving Through Brokenness", zhDescription: "关于文字、良知、失去、婚姻、破碎、爱与盼望的思考，在外在世界不再稳固时追问什么仍然值得持守。", enDescription: "Reflections on words, conscience, loss, marriage, brokenness, love, and hope—asking what remains when the outward world is no longer secure."},
] as const;

export const ebookPdfUrl = (volume: number) => `/ebooks/the-light-they-could-not-erase-vol-${volume}.pdf`;
export const ebookCoverUrl = (volume: number) => `/images/ebooks/the-light-they-could-not-erase-vol-${volume}.png`;
