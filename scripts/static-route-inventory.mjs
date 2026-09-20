import fs from "node:fs";
import path from "node:path";

// Next's global-error boundary has no standalone export; placeholders are
// separately removed/checked by the static-export validator.
export function validateGeneratedRouteArtifacts(routes, output) {
  if (!routes.length) throw new Error("empty generated route inventory");
  for (const route of routes) {
    if (route === "/_global-error") continue;
    if (!route.startsWith("/") || route.includes("..") || /(?:__preview|artifacts\/intake|config\/content)/.test(route)) throw new Error(`invalid public route: ${route}`);
    const relative = route === "/" ? "index.html" : route.slice(1);
    if (![relative, `${relative}.html`, `${relative}/index.html`].some((file) => fs.existsSync(path.join(output, file)) && fs.statSync(path.join(output, file)).isFile())) throw new Error(`missing generated route artifact: ${route}`);
  }
}
