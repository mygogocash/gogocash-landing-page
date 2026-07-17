import { createRequire, registerHooks } from "node:module";
import { pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const typescript6Url = pathToFileURL(
  require.resolve("@typescript/typescript6"),
).href;

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "typescript") {
      return {
        shortCircuit: true,
        url: typescript6Url,
      };
    }

    return nextResolve(specifier, context);
  },
});
