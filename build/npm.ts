import { build, emptyDir } from "jsr:@deno/dnt@^0.42.1";
import type { PackageMappedSpecifier } from "jsr:@deno/dnt@^0.42.1/transform";

// Convert part of jsr dependencies to npm

// Motivation:
// `@deno/dnt` can't convert jsr imports to npm,
// but it has no problem with that if the import is http,
// so we convert jsr imports to http beforehand

const jsrDependencies: { [specifier: `jsr:${string}`]: PackageMappedSpecifier } = {
    "jsr:@noble/hashes@^1.8.0/sha3": {
        name: "@noble/hashes",
        version: "^1.8.0",
        subPath: "sha3",
    },
};

const toUrl = (jsr: string) => jsr.replace("jsr:", "https://esm.sh/");

const originalDenoConfig = await Deno.readTextFile("./deno.json");
const tempDenoConfig = Object.keys(jsrDependencies).reduce(
    (config, jsr) => config.replace(jsr, toUrl(jsr)),
    originalDenoConfig,
);
await Deno.writeTextFile("./deno.json", tempDenoConfig);

const mappings = Object.fromEntries(
    Object.entries(jsrDependencies).map(([jsr, metadata]) => [toUrl(jsr), metadata]),
);

// Build npm package
try {
    await emptyDir("./build/npm");
    await build({
        entryPoints: [
            { name: ".", path: "./mod.ts" },
            { name: "./types", path: "./src/types/mod.ts" },
            { name: "./signing", path: "./src/signing.ts" },
        ],
        outDir: "./build/npm",
        shims: {},
        typeCheck: "both",
        test: false,
        scriptModule: "umd",
        mappings,
        package: {
            name: "@nktkas/hyperliquid",
            version: Deno.args[0],
            description:
                "Unofficial Hyperliquid API SDK for all major JS runtimes, written in TypeScript and provided with tests",
            keywords: [
                "api",
                "library",
                "typescript",
                "sdk",
                "crypto",
                "trading",
                "blockchain",
                "cryptocurrency",
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
                node: ">=22.4.0", // WebSocket support
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
} finally {
    await Deno.writeTextFile("./deno.json", originalDenoConfig);
}
