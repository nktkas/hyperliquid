import { assert } from "jsr:@std/assert@^1.0.9";
import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.2";
import { HttpTransport, PublicClient } from "../../../index.ts";
import { assertIncludesNotEmptyArray, assertJsonSchema } from "../../utils.ts";

Deno.test("metaAndAssetCtxs", async (t) => {
    // Create TypeScript type schemas
    const tsjSchemaGenerator = tsj.createGenerator({ path: resolve("./index.ts"), skipTypeCheck: true });
    const schema = tsjSchemaGenerator.createSchema("MetaAndAssetCtxs");

    // Create client
    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const client = new PublicClient({ transport });

    //Test
    const data = await client.metaAndAssetCtxs();

    assertJsonSchema(schema, data);
    assertIncludesNotEmptyArray(data);

    await t.step("validate AssetCtx as second item", async (t) => {
        await t.step(
            "some should have a premium as string",
            () => assert(data[1].some((item) => typeof item.premium === "string")),
        );

        await t.step(
            "some should have a premium as null",
            () => assert(data[1].some((item) => item.premium === null)),
        );

        await t.step(
            "some should have a midPx as string",
            () => assert(data[1].some((item) => typeof item.midPx === "string")),
        );

        await t.step(
            "some should have a midPx as null",
            () => assert(data[1].some((item) => item.midPx === null)),
        );

        await t.step(
            "some should have a impactPxs as array of strings",
            () =>
                assert(
                    data[1].some((item) =>
                        Array.isArray(item.impactPxs) &&
                        item.impactPxs.length > 0 &&
                        item.impactPxs.every((item) => typeof item === "string")
                    ),
                ),
        );

        await t.step(
            "some should have a impactPxs as null",
            () => assert(data[1].some((item) => item.impactPxs === null)),
        );
    });
});
