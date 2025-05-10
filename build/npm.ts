import { build, emptyDir } from "jsr:@deno/dnt@^0.42.1";

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
    package: {
        name: "@nktkas/hyperliquid",
        version: Deno.args[0],
        description:
            "Unofficial Hyperliquid API SDK for all major JS runtimes, written in TypeScript and provided with tests",
        keywords: [
            "api",
            "blockchain",
            "crypto",
            "cryptocurrency",
            "dex",
            "exchange",
            "hyperliquid",
            "library",
            "sdk",
            "trading",
            "typescript",
            "web3",
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
            node: ">=22.4.0",
        },
    },
    compilerOptions: {
        lib: ["ES2022", "DOM", "ESNext.Disposable"],
    },
    postBuild() {
        Deno.copyFileSync("CONTRIBUTING.md", "build/npm/CONTRIBUTING.md");
        Deno.copyFileSync("LICENSE", "build/npm/LICENSE");
        Deno.copyFileSync("README.md", "build/npm/README.md");
        Deno.copyFileSync("SECURITY.md", "build/npm/SECURITY.md");
    },
});
