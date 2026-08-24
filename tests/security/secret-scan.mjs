import fs from "node:fs";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const patterns = [
  ["private key", /-----BEGIN (?:RSA |OPENSSH |EC |DSA )?PRIVATE KEY-----/],
  ["GitHub token", /\b(?:gh[pousr]_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/],
  ["AWS access key", /\bAKIA[0-9A-Z]{16}\b/],
  ["OpenAI-style secret", /\bsk-[A-Za-z0-9_-]{20,}\b/],
];

export function findingsInText(text) {
  return patterns.flatMap(([label, pattern]) => pattern.test(text) ? [label] : []);
}

export function scanTrackedFiles() {
  const listed = spawnSync("git", ["ls-files", "-z"], {encoding: "utf8"});
  if (listed.status !== 0) throw new Error(listed.stderr || "git ls-files failed");
  const findings = [];
  for (const file of listed.stdout.split("\0").filter(Boolean)) {
    const buffer = fs.readFileSync(file);
    if (buffer.includes(0)) continue;
    for (const label of findingsInText(buffer.toString("utf8"))) findings.push(`${file}: ${label}`);
  }
  return findings;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const findings = scanTrackedFiles();
  if (findings.length) {
    console.error(`Secret scan failed:\n${findings.join("\n")}`);
    process.exitCode = 1;
  } else {
    console.log("Secret scan PASS");
  }
}
