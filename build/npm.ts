import { build, emptyDir } from "jsr:@deno/dnt@0.41.3";

await emptyDir("./build/npm");

await build({
    entryPoints: ["./mod.ts"],
    outDir: "./build/npm",
    shims: {},
    typeCheck: "both",
    test: false,
    package: {
        name: "@nktkas/hyperliquid",
        version: Deno.args[0],
        description: "Unofficial Hyperliquid API SDK for all major JS runtimes",
        keywords: ["api", "typescript", "sdk", "hyperliquid"],
        author: {
            name: "nktkas",
            email: "github.turk9@passmail.net",
            url: "https://github.com/nktkas",
        },
        homepage: "https://github.com/nktkas/hyperliquid#readme",
        repository: {
            type: "git",
            url: "git+https://github.com/nktkas/hyperliquid.git",
        },
        license: "MIT",
        bugs: {
            url: "https://github.com/nktkas/hyperliquid/issues",
        },
    },
    importMap: "deno.json",
    compilerOptions: {
        lib: ["ESNext", "DOM"],
    },
    postBuild() {
        Deno.copyFileSync("CONTRIBUTING.md", "build/npm/CONTRIBUTING.md");
        Deno.copyFileSync("LICENSE", "build/npm/LICENSE");
        Deno.copyFileSync("README.md", "build/npm/README.md");
        Deno.copyFileSync("SECURITY.md", "build/npm/SECURITY.md");
    },
});
