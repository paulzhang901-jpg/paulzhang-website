/* global FixedLengthStream */
import episode from "../../../config/one-phrase-one-story/001.json" with {type: "json"};

function unavailable() {
  return new Response(null, {status: 502, headers: {"cache-control": "no-store"}});
}

export async function onRequest({request}) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response(null, {status: 405, headers: {allow: "GET, HEAD"}});
  }

  const headers = new Headers({"accept-encoding": "identity"});
  for (const name of ["range", "if-range"]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  let upstream;
  try {
    upstream = await fetch(episode.mp4_url, {method: request.method, headers, redirect: "follow"});
  } catch {
    return unavailable();
  }

  const size = String(episode.video_bytes);
  const contentRange = upstream.headers.get("content-range");
  if (upstream.status === 416 && contentRange === "bytes */" + size) {
    await upstream.body?.cancel();
    return new Response(null, {status: 416, headers: {
      "content-range": contentRange, "accept-ranges": "bytes", "cache-control": "no-store",
    }});
  }

  const length = upstream.headers.get("content-length");
  const range = contentRange?.match(/^bytes (\d+)-(\d+)\/(\d+)$/);
  const validFull = upstream.status === 200 && length === size;
  const validPartial = upstream.status === 206 && range?.[3] === size &&
    Number(range[1]) <= Number(range[2]) && Number(range[2]) < episode.video_bytes &&
    Number(length) === Number(range[2]) - Number(range[1]) + 1;
  if ((!validFull && !validPartial) || (request.method === "GET" && !upstream.body)) {
    await upstream.body?.cancel();
    return unavailable();
  }

  const responseHeaders = new Headers({
    "content-type": "video/mp4",
    "content-disposition": "inline",
    "content-length": length,
    "accept-ranges": "bytes",
    "cache-control": "public, max-age=3600, no-transform",
  });
  for (const name of ["content-range", "etag", "last-modified"]) {
    const value = upstream.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }
  const init = {status: upstream.status, headers: responseHeaders};
  if (request.method === "HEAD") return new Response(null, init);

  // Workers derives the wire Content-Length from the stream, not the header.
  const stream = new FixedLengthStream(Number(length));
  void upstream.body.pipeTo(stream.writable).catch(() => {});
  return new Response(stream.readable, init);
}
