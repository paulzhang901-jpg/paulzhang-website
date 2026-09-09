import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {validateGeneratedRouteArtifacts} from "../../scripts/static-route-inventory.mjs";

test("generated route coverage accepts added publications without a total-count edit and rejects missing/private artifacts", () => {
  const output = fs.mkdtempSync(path.join(os.tmpdir(), "static-route-inventory-"));
  try {
    fs.mkdirSync(path.join(output, "library"));
    for (const file of ["index.html", "library.html", "library/tanqin-de-shaonian.html"]) fs.writeFileSync(path.join(output, file), "<html></html>");
    assert.doesNotThrow(() => validateGeneratedRouteArtifacts(["/", "/library"], output));
    assert.doesNotThrow(() => validateGeneratedRouteArtifacts(["/", "/library", "/library/tanqin-de-shaonian"], output));
    assert.throws(() => validateGeneratedRouteArtifacts(["/en/library/tanqin-de-shaonian"], output), /missing generated route/);
    assert.throws(() => validateGeneratedRouteArtifacts(["/__preview/sermons/hidden"], output), /invalid public route/);
    assert.throws(() => validateGeneratedRouteArtifacts([], output), /empty generated/);
  } finally { fs.rmSync(output, {recursive: true, force: true}); }
});
