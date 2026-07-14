// deno-lint-ignore-file no-import-prefix

/**
 * Builds the Deno library into an ESM-only npm package.
 *
 * @example
 * ```sh
 * deno run -A .github/scripts/build_npm.ts
 * ```
 */

import { build } from "jsr:@nktkas/dtn@^2";
import denoJson from "../../deno.json" with { type: "json" };

if (import.meta.main) {
  await build({
    outDir: "dist",
    denoJson,
    npmReplacements: {
      "@valibot/valibot": "valibot",
      "@noble/hashes": "@noble/hashes",
      "@nktkas/rews": "@nktkas/rews",
    },
    packageJson: {
      description: "Hyperliquid API SDK for all major JS runtimes, written in TypeScript.",
      keywords: [
        "api",
        "library",
        "sdk",
        "javascript",
        "typescript",
        "cryptocurrency",
        "trading",
        "blockchain",
        "exchange",
        "web3",
        "dex",
        "hyperliquid",
      ],
      homepage: "https://github.com/nktkas/hyperliquid",
      bugs: { url: "https://github.com/nktkas/hyperliquid/issues" },
      repository: { type: "git", url: "git+https://github.com/nktkas/hyperliquid.git" },
      license: "MIT",
      author: { name: "nktkas", email: "github.turk9@passmail.net", url: "https://github.com/nktkas" },
      sideEffects: false,
      engines: { node: ">=22.12.0" },
    },
    copyFiles: ["README.md", "LICENSE", "CONTRIBUTING.md", "SECURITY.md"],
  });
}
