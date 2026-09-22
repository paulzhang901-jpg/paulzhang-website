import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import {aboutSectionCopy} from "../../src/lib/about";
import {getAboutBiography} from "../../src/lib/about-biography";
import {metadataForAboutSection} from "../../src/lib/seo/metadata";

const zhBody = `对我来说，写作与讲道不是两件彼此分开的事。

讲道，是在具体的人群中传讲真理；写作，则让这些思考越过时间与空间，继续与更多人的生命相遇。无论站在讲台上，还是坐在书桌前，我所关心的始终是同一件事：怎样让古老而常新的真理，进入今天真实的人生。

这些年来，我持续从事圣经讲道、信仰写作与生命分享。我的内容常常从圣经出发，也从现实生活出发——家庭与婚姻、金钱与工作、苦难与失去、成长与选择、教会与门徒训练，以及一个人在复杂世界中如何持守信仰、认识自己，并学习忠心地走完人生的道路。

我并不希望写作只是制造更多文字，也不希望讲道只停留在知识与道理上。

真正有价值的真理，应当能够被理解、被相信，也能够被活出来。

因此，我越来越看重圣经真理与真实生命之间的连接：既认真面对经文本身，也认真面对今天的人正在经历的问题；既关心一个人“知道什么”，也关心这些真理最终如何塑造他的品格、关系、选择与生活方式。

我也相信，一篇文章、一篇讲道，甚至一句在适当时候说出的话，都可能成为一粒种子。我们未必马上看见结果，但当真理被忠实地传递，它可能在许多年以后，仍然继续影响一个人的生命。

所以，我愿意继续写，也愿意继续讲。

不是因为我已经拥有所有答案，而是因为在自己不断学习、跌倒、经历和成长的路上，我愿意把所领受的整理下来，与更多同行的人分享。

以真理建立生命，在关系中一同成长。

这也是我写作、讲道与分享最重要的方向。`;

const enBody = `For me, writing and preaching are not two separate callings.

Preaching brings truth into the lives of people gathered in a particular place and moment. Writing allows those same reflections to travel beyond the limits of time and place and continue speaking into the lives of others.

Whether I am standing behind a pulpit or sitting at my desk, one question continues to shape my work:

How can timeless biblical truth speak meaningfully into the realities of life today?

Over the years, I have continued to preach, write, and share about faith and life. Much of my work begins with Scripture, but it also begins with the questions people actually carry—with marriage and family, work and money, suffering and loss, growth and difficult choices, the church and discipleship, and what it means to remain faithful in a complicated and changing world.

I do not want writing simply to produce more words, nor preaching merely to communicate more information.

Truth that matters should not only be understood. It should be believed, practiced, and lived.

That is why I care deeply about connecting biblical truth with everyday life. I want to take Scripture seriously, while also taking seriously the people who are trying to live faithfully in the real world. The question is not only, “What do we know?” but also, “What kind of people are we becoming because of what we know?”

I believe a sermon, an essay, or even a single sentence spoken at the right moment can become a seed. We may not see its fruit immediately. But when truth is faithfully shared, it can continue shaping a life years after the words were first spoken or written.

So I continue to write, and I continue to preach.

Not because I have all the answers, but because I am still learning, walking, struggling, experiencing grace, and growing. Along the way, I want to preserve what I have learned and share it with others who are walking their own journeys.

Rooted in truth. Growing together in relationship.

That is the heart behind my writing, preaching, and sharing.`;

const bodyText = (locale:"zh-CN"|"en-US") => getAboutBiography(locale,"writing-preaching")!.paragraphs.map(part=>Array.isArray(part)?part.join("\n\n"):part).join("\n\n");

test("Writing & Preaching card uses the owner-approved bilingual copy",()=>{
  assert.deepEqual(aboutSectionCopy("zh-CN","writing-preaching"),{label:"写作与讲道",summary:"从文字到讲台，认识 Paul 如何连接圣经真理、真实人生与生命成长。",seoDescription:"认识 Paul Zhang 如何通过写作、讲道与真理分享，连接圣经真理、真实人生与生命成长。"});
  assert.deepEqual(aboutSectionCopy("en-US","writing-preaching"),{label:"Writing & Preaching",summary:"Discover how Paul connects biblical truth with real life through writing, preaching, and reflections on spiritual growth.",seoDescription:"Discover how Paul Zhang connects biblical truth with real life through writing, preaching, and reflections on spiritual growth."});
});

test("Writing & Preaching bodies preserve the fixed bilingual copy verbatim",()=>{
  assert.equal(bodyText("zh-CN"),zhBody);
  assert.equal(bodyText("en-US"),enBody);
});

test("Writing & Preaching metadata preserves same-page bilingual alternates",()=>{
  const zh=metadataForAboutSection("writing-preaching","zh-CN");
  const en=metadataForAboutSection("writing-preaching","en-US");
  assert.equal(zh.title,"写作与讲道");
  assert.equal(en.title,"Writing & Preaching");
  assert.equal(zh.description,"认识 Paul Zhang 如何通过写作、讲道与真理分享，连接圣经真理、真实人生与生命成长。");
  assert.equal(en.description,"Discover how Paul Zhang connects biblical truth with real life through writing, preaching, and reflections on spiritual growth.");
  assert.equal(zh.alternates?.canonical,"https://paulzhang.org/about/writing-preaching");
  assert.deepEqual(zh.alternates?.languages,{"zh-CN":"https://paulzhang.org/about/writing-preaching","en-US":"https://paulzhang.org/en/about/writing-preaching"});
  assert.equal(en.alternates?.canonical,"https://paulzhang.org/en/about/writing-preaching");
});

test("task does not create unsupported Sermons, Articles, or Books category routes",()=>{
  const routes=fs.readFileSync("config/architecture/routes.yaml","utf8");
  for(const unsupported of ["/library/sermons","/library/articles","/library/books","/library/publications"]) assert.doesNotMatch(routes,new RegExp(unsupported.replaceAll("/","\\/")));
});
