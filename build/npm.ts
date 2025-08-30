/**
 * Builds the Deno library for working with NodeJS or publishing to npm
 * Command: deno run --allow-env --allow-read --allow-write --allow-run build/npm.ts
 */

import { build, emptyDir } from "jsr:@deno/dnt@^0.42.1";

await emptyDir("./build/npm");
await build({
    entryPoints: [
        { name: ".", path: "./mod.ts" },
        { name: "./types", path: "./src/types/mod.ts" },
        { name: "./signing", path: "./src/signing/mod.ts" },
    ],
    outDir: "./build/npm",
    shims: {},
    typeCheck: "both",
    test: false,
    package: {
        name: "@nktkas/hyperliquid",
        version: JSON.parse(await Deno.readTextFile("./deno.json")).version,
        description: "Unofficial Hyperliquid API SDK for all major JS runtimes, written in TypeScript.",
        keywords: [
            "api",
            "library",
            "sdk",
            "javascript",
            "typescript",
            "crypto",
            "cryptocurrency",
            "trading",
            "blockchain",
            "exchange",
            "web3",
            "dex",
            "hyperliquid",
        ],
        author: {
            name: "nktkas",
            email: "github.turk9@passmail.net",
            url: "https://github.com/nktkas",
        },
        homepage: "https://github.com/nktkas/hyperliquid",
        repository: {
            type: "git",
            url: "git+https://github.com/nktkas/hyperliquid.git",
        },
        bugs: {
            url: "https://github.com/nktkas/hyperliquid/issues",
        },
        license: "MIT",
        engines: {
            /**
             * - v22.4.0: Native WebSocket support
             * - v24.0.0: https://github.com/nktkas/hyperliquid/issues/34
             */
            node: ">=24.0.0",
        },
        sideEffects: false,
    },
    compilerOptions: {
        lib: ["ESNext", "DOM"],
        target: "Latest",
    },
});

await Promise.all([
    // Copy additional files to npm build directory
    Deno.copyFile("CONTRIBUTING.md", "build/npm/CONTRIBUTING.md"),
    Deno.copyFile("LICENSE", "build/npm/LICENSE"),
    Deno.copyFile("README.md", "build/npm/README.md"),
    Deno.copyFile("SECURITY.md", "build/npm/SECURITY.md"),
    // Add more items to ignore list in .npmignore
    Deno.writeTextFile("./build/npm/.npmignore", "node_modules\n", { append: true }),
    Deno.writeTextFile("./build/npm/.npmignore", "package-lock.json\n", { append: true }),
]);
