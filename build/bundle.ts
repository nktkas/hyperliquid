/**
 * Builds the Deno library into a bundle and calculates the bundle size
 * Command: deno run -A build/bundle.ts
 */

import { build } from "npm:esbuild";
import { denoPlugins } from "jsr:@luca/esbuild-deno-loader";

// Build bundle
const nodeModulesExists = await Deno.stat("./node_modules").then(() => true).catch(() => false);

await build({
    plugins: [...denoPlugins({ nodeModulesDir: "auto" })],
    entryPoints: {
        mod: "./mod.ts",
        signing: "./src/signing/mod.ts",
    },
    format: "esm",
    bundle: true,
    target: "esnext",
    minify: true,
    outdir: "./build/bundle",
    sourcemap: true,
});

if (!nodeModulesExists) {
    await Deno.remove("./node_modules", { recursive: true });
}

// Calculate sizes
async function gzip(data: Uint8Array): Promise<Uint8Array> {
    const gzipStream = new CompressionStream("gzip");
    const dataStream = ReadableStream.from([data]);
    const [compressed] = await Array.fromAsync(dataStream.pipeThrough(gzipStream));
    return compressed;
}

const bundleFiles = await Array.fromAsync(Deno.readDir("./build/bundle"));
const jsFiles = bundleFiles.filter((f) => f.name.endsWith(".js"));

for (const file of jsFiles) {
    const minifiedCode = await Deno.readFile(`./build/bundle/${file.name}`);
    const gzippedCode = await gzip(minifiedCode);

    const minifiedSize = (minifiedCode.length / 1024).toFixed(1);
    const gzippedSize = (gzippedCode.length / 1024).toFixed(1);
    const compression = ((1 - gzippedCode.length / minifiedCode.length) * 100).toFixed(1);

    console.log(`${file.name}: 📦 Minified: ${minifiedSize}KB → ⚡ Gzipped: ${gzippedSize}KB (-${compression}%)`);
}
