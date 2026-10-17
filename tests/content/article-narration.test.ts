import test from "node:test";
import assert from "node:assert/strict";
import {claimNarration, ownsNarration, releaseNarration} from "../../src/components/content/narration-playback";
import {narrationPresentationHash, resolvePublishedNarration, validateNarrationCatalog} from "../../src/lib/content/published-narrations";

const source = {canonicalId:"sermon-revelation-9-20-21",language:"en-US" as const,title:"Still They Did Not Repent",body:"Approved text.",status:"published" as const,visibility:"public" as const,accessLevel:"public" as const};
const record = {canonicalId:source.canonicalId,locale:source.language,state:"PUBLISHED",kind:"production",sourceSha256:"a".repeat(64),presentationSha256:narrationPresentationHash(source),presentationPolicy:"article-narration-presentation/v1",audioSha256:"b".repeat(64),voiceConfigSha256:"c".repeat(64),voiceProfileId:"english-profile",narrationVersion:1,publicationEventId:"protected-publisher-event",src:`/media/narration/${"b".repeat(64)}.mp3`};
const catalog = {schemaVersion:1,records:[record]};

test("missing, stale or other-language narration preserves browser fallback",()=>{
  assert.equal(resolvePublishedNarration(source,{schemaVersion:1,records:[]}),undefined);
  assert.equal(resolvePublishedNarration({...source,body:"Changed text."},catalog),undefined);
  assert.equal(resolvePublishedNarration({...source,language:"zh-CN"},catalog),undefined);
  assert.equal(resolvePublishedNarration({...source,status:"draft"},catalog),undefined);
});
test("current published entry resolves the MP3 without modifying content",()=>{
  const before=JSON.stringify(source);
  assert.deepEqual(resolvePublishedNarration(source,catalog),{src:record.src,audioSha256:record.audioSha256});
  assert.equal(JSON.stringify(source),before);
});
test("catalog rejects mock, unreviewed, duplicate and external URL records",()=>{
  for(const changed of [{...record,kind:"mock"},{...record,state:"APPROVED"},{...record,publicationEventId:""},{...record,src:"https://other.test/audio.mp3"}]) {
    assert.throws(()=>validateNarrationCatalog({schemaVersion:1,records:[changed]}));
  }
  assert.throws(()=>validateNarrationCatalog({schemaVersion:1,records:[record,record]}));
});
test("changing engines stops the prior owner and ignores stale cleanup",()=>{
  const browser=Symbol(),mp3=Symbol();const events:string[]=[];
  claimNarration(browser,()=>events.push("stop browser"));
  claimNarration(mp3,()=>events.push("stop mp3"));
  releaseNarration(browser);assert.equal(ownsNarration(mp3),true);
  claimNarration(mp3,()=>events.push("stop mp3"));assert.deepEqual(events,["stop browser"]);
  claimNarration(browser,()=>events.push("stop browser"));assert.deepEqual(events,["stop browser","stop mp3"]);
  releaseNarration(browser);assert.equal(ownsNarration(browser),false);
});
