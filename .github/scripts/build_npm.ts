// deno-lint-ignore-file no-import-prefix

/**
 * Builds the Deno library for working with NodeJS or publishing to npm
 *
 * @example
 * ```sh
 * deno run -A .github/scripts/build_npm.ts
 * ```
 */

import { build, emptyDir } from "jsr:@deno/dnt@^0.42.3";
import denoJson from "../../deno.json" with { type: "json" };

/**
 * Convert part of jsr dependencies to npm in deno.json imports.
 * HACK: I don't know of any other way to instruct `@deno/dnt` to convert jsr dependencies into npm equivalents.
 */
async function modifyImports(): Promise<() => Promise<void>> {
  // Define mappings from jsr to npm
  const jsr2npm = {
    "jsr:@nktkas/rews": "npm:@nktkas/rews",
    "jsr:@noble/hashes": "npm:@noble/hashes",
    "jsr:@paulmillr/micro-eth-signer": "npm:micro-eth-signer",
    // "jsr:@std/msgpack": "...", // No npm equivalent available
    "jsr:@valibot/valibot": "npm:valibot",
  };

  // Read and modify deno.json imports
  const rawConfig = await Deno.readTextFile("./deno.json");
  let tempConfig = rawConfig;
  for (const [jsr, npm] of Object.entries(jsr2npm)) {
    tempConfig = tempConfig.replace(jsr, npm);
  }
  await Deno.writeTextFile("./deno.json", tempConfig);

  // Return a restore function to revert changes in deno.json
  return async () => {
    await Deno.writeTextFile("./deno.json", rawConfig);
  };
}

const restoreConfig = await modifyImports();
try {
  await emptyDir("./build/npm");
  await build({
    entryPoints: [
      ...Object.entries(denoJson.exports).map(([k, v]) => ({ name: k, path: v })),
      { name: "@nktkas/hyperliquid", path: "./bin/cli.ts", kind: "bin" },
    ],
    outDir: "./build/npm",
    shims: {},
    typeCheck: "both",
    test: false,
    package: {
      name: "@nktkas/hyperliquid",
      version: denoJson.version,
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
      bugs: {
        url: "https://github.com/nktkas/hyperliquid/issues",
      },
      repository: {
        type: "git",
        url: "git+https://github.com/nktkas/hyperliquid.git",
      },
      license: "MIT",
      author: {
        name: "nktkas",
        email: "github.turk9@passmail.net",
        url: "https://github.com/nktkas",
      },
      sideEffects: false,
      engines: {
        node: ">=20.19.0",
      },
    },
    compilerOptions: {
      lib: ["ESNext", "DOM"],
      target: "Latest",
      sourceMap: true,
    },
  });
  await Promise.all([
    // Copy additional files to npm build directory
    Deno.copyFile("CONTRIBUTING.md", "build/npm/CONTRIBUTING.md"),
    Deno.copyFile("LICENSE", "build/npm/LICENSE"),
    Deno.copyFile("README.md", "build/npm/README.md"),
    Deno.copyFile("SECURITY.md", "build/npm/SECURITY.md"),
  ]);
} finally {
  await restoreConfig();
}
