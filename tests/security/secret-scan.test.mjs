import assert from "node:assert/strict";
import test from "node:test";
import { findingsInText, scanTrackedFiles } from "./secret-scan.mjs";

test("secret patterns detect representative credentials", () => {
  assert.deepEqual(findingsInText("safe fixture"), []);
  assert.ok(findingsInText("-----BEGIN " + "PRIVATE KEY-----").includes("private key"));
  assert.ok(findingsInText("gh" + "p_abcdefghijklmnopqrstuvwxyz").includes("GitHub token"));
  assert.ok(findingsInText("AKIA" + "ABCDEFGHIJKLMNOP").includes("AWS access key"));
});

test("tracked repository files contain no high-confidence secrets", () => {
  assert.deepEqual(scanTrackedFiles(), []);
});
