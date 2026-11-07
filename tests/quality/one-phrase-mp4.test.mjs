import assert from "node:assert/strict";
import test from "node:test";
import {readFileSync} from "node:fs";
import {onRequest} from "../../functions/media/one-phrase-one-story/001.mp4.js";
import episode from "../../config/one-phrase-one-story/001.json" with {type: "json"};

const request = (options) => new Request("https://paulzhang.org" + episode.playback_url, options);

test("only the approved playback URL is routed through Pages Functions", () => {
  const routes = JSON.parse(readFileSync("public/_routes.json", "utf8"));
  assert.deepEqual(routes, {version: 1, include: [episode.playback_url], exclude: []});
});

test("forwards the Safari probe and streams the original bytes as inline MP4", async (t) => {
  globalThis.FixedLengthStream = TransformStream;
  t.after(() => { delete globalThis.FixedLengthStream; });
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url, episode.mp4_url);
    assert.equal(options.headers.get("range"), "bytes=0-1");
    return new Response(Uint8Array.of(0, 0), {status: 206, headers: {
      "content-length": "2", "content-range": "bytes 0-1/" + episode.video_bytes,
      "content-type": "application/octet-stream", "content-disposition": "attachment",
    }});
  });
  const response = await onRequest({request: request({headers: {range: "bytes=0-1"}})});
  assert.equal(response.status, 206);
  assert.equal(response.headers.get("content-type"), "video/mp4");
  assert.equal(response.headers.get("content-disposition"), "inline");
  assert.equal(response.headers.get("accept-ranges"), "bytes");
  assert.equal(response.headers.get("content-range"), "bytes 0-1/" + episode.video_bytes);
  assert.deepEqual(new Uint8Array(await response.arrayBuffer()), Uint8Array.of(0, 0));
});

test("serves full-file HEAD with no body and rejects invalid upstream responses", async (t) => {
  const upstream = t.mock.method(globalThis, "fetch", async (_, options) => {
    assert.equal(options.method, "HEAD");
    return new Response(null, {headers: {"content-length": String(episode.video_bytes)}});
  });
  const response = await onRequest({request: request({method: "HEAD"})});
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-length"), String(episode.video_bytes));
  assert.equal(response.body, null);
  upstream.mock.mockImplementation(async () => new Response("invalid", {status: 200}));
  assert.equal((await onRequest({request: request()})).status, 502);
  assert.equal((await onRequest({request: request({method: "POST"})})).status, 405);
});
