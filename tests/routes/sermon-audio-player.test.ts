import test from "node:test";
import assert from "node:assert/strict";
import {isValidElement, type ReactElement} from "react";
import {getContentRepository} from "../../src/lib/content/repository";
import {resolveLibrarySlug} from "../../src/lib/routing/resolvers";
import {loadPublishedSermon} from "../../src/lib/sermons/published";
import {DynamicContentRoute} from "../../src/components/content/dynamic-content-route";
import {ContentPage} from "../../src/components/content/content-page";
import {ArticleNarration} from "../../src/components/content/article-narration";
import {SermonPublicationBody} from "../../src/components/content/sermon-publication-page";
import {resolvePublishedNarration} from "../../src/lib/content/published-narrations";

function find(node:unknown, type:unknown):ReactElement<Record<string,unknown>>|undefined {
 if(Array.isArray(node)){for(const child of node){const result=find(child,type);if(result)return result;}return;}
 if(!isValidElement(node))return;
 if(node.type===type)return node as ReactElement<Record<string,unknown>>;
 return find((node.props as {children?:unknown}).children,type);
}
test("actual bilingual sermon routes retain approved narration while preserving the archived display body",async()=>{
 const repository=await getContentRepository();
 for(const locale of ["zh-CN","en-US"] as const){
  const item=repository.getContentBySlug("library","still-they-did-not-repent",locale)!;
  const sermon=loadPublishedSermon(item.id,locale)!;
  const resolution=resolveLibrarySlug(item.slug,locale,repository);
  assert.equal(resolution.kind,"content");
  const route=await DynamicContentRoute({resolution,locale,routeId:"library",repository});
  assert.ok(isValidElement(route));assert.equal(route.type,ContentPage);
  const props=route.props as Parameters<typeof ContentPage>[0];
  assert.equal(props.item.body,sermon.body);
  const page=await ContentPage(props);
  const player=find(page,ArticleNarration);assert.ok(player);
  assert.deepEqual(player.props.narration,resolvePublishedNarration(item));
  assert.ok(player.props.narration,"approved MP3 must survive the display-body projection");
  const body=find(page,SermonPublicationBody);assert.ok(body);
  assert.equal(body.props.body,sermon.body);
 }
});
