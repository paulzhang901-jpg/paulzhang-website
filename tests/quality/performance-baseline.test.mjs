import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();

function filesWithin(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, {withFileTypes: true}).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? filesWithin(target) : [target];
  });
}

test("Client Components remain explicitly reviewed and minimal", () => {
  const clientFiles = filesWithin(path.join(root, "src"))
    .filter((file) => /\.[cm]?[jt]sx?$/.test(file) && fs.readFileSync(file, "utf8").startsWith('"use client"'))
    .map((file) => path.relative(root, file));
  assert.deepEqual(clientFiles, ["src/components/navigation/language-switcher.tsx"]);
});

test("raw public assets stay below the V1 one-megabyte safeguard", () => {
  const oversized = filesWithin(path.join(root, "public"))
    .filter((file) => fs.statSync(file).size > 1024 * 1024)
    .map((file) => path.relative(root, file));
  assert.deepEqual(oversized, []);
});
