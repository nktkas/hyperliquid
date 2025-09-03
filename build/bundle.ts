/**
 * Builds the Deno library into a bundle and calculates the bundle size
 * Command: deno run --allow-env --allow-read --allow-write --allow-run build/bundle.ts
 */

import { build } from "npm:esbuild@0.25.5";
import { denoPlugins } from "jsr:@luca/esbuild-deno-loader@0.11.1";

// Build bundle
const outdir = "./build/bundle";
const nodeModulesExists = await Deno.stat("./node_modules").then(() => true).catch(() => false);

await build({
    plugins: [...denoPlugins({ nodeModulesDir: "auto" })],
    entryPoints: {
        mod: "./mod.ts",
        schemas: "./src/schemas/mod.ts",
        signing: "./src/signing/mod.ts",
    },
    format: "esm",
    bundle: true,
    target: "esnext",
    minify: true,
    outdir,
    sourcemap: true,
});

if (!nodeModulesExists) {
    await Deno.remove("./node_modules", { recursive: true });
}

// Calculate sizes
async function gzip(data: Uint8Array): Promise<Uint8Array> {
    const [compressed] = await Array.fromAsync(
        ReadableStream.from([data]).pipeThrough(new CompressionStream("gzip")),
    );
    return compressed;
}

const bundleFiles = await Array.fromAsync(Deno.readDir(outdir));
const jsFiles = bundleFiles.filter((f) => f.name.endsWith(".js"));
for (const file of jsFiles) {
    const minifiedCode = await Deno.readFile(`${outdir}/${file.name}`);
    const gzippedCode = await gzip(minifiedCode);

    const minifiedSize = (minifiedCode.length / 1024).toFixed(1);
    const gzippedSize = (gzippedCode.length / 1024).toFixed(1);
    const compression = ((1 - gzippedCode.length / minifiedCode.length) * 100).toFixed(1);

    console.log(`${file.name}: 📦 Minified: ${minifiedSize}KB → ⚡ Gzipped: ${gzippedSize}KB (-${compression}%)`);
}
