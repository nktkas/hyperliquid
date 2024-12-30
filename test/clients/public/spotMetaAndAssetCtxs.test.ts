import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.2";
import { assert } from "jsr:@std/assert@^1.0.9";
import { HttpTransport, PublicClient } from "../../../index.ts";
import { assertIncludesNotEmptyArray, assertJsonSchema } from "../../utils.ts";

Deno.test("spotMetaAndAssetCtxs", async (t) => {
    // Create TypeScript type schemas
    const tsjSchemaGenerator = tsj.createGenerator({ path: resolve("./index.ts"), skipTypeCheck: true });
    const schema = tsjSchemaGenerator.createSchema("SpotMetaAndAssetCtxs");

    // Create client
    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const client = new PublicClient({ transport });

    //Test
    const data = await client.spotMetaAndAssetCtxs();

    assertJsonSchema(schema, data);
    assertIncludesNotEmptyArray(data);

    await t.step("validate SpotMeta as first item", async (t) => {
        await t.step("tokens[].evmContract", async (t) => {
            await t.step(
                "some should be null",
                () => assert(data[0].tokens.some((item) => item.evmContract === null)),
            );
            await t.step(
                "some should not be null",
                () => assert(data[0].tokens.some((item) => item.evmContract !== null)),
            );
        });

        await t.step("tokens[].fullName", async (t) => {
            await t.step(
                "some should be null",
                () => assert(data[0].tokens.some((item) => item.fullName === null)),
            );
            await t.step(
                "some should be string",
                () => assert(data[0].tokens.some((item) => typeof item.fullName === "string")),
            );
        });
    });

    await t.step("validate SpotAssetCtx as second item", async (t) => {
        await t.step(
            "some midPx should be string",
            () => assert(data[1].some((item) => typeof item.midPx === "string")),
        );
        await t.step(
            "some midPx should be null",
            () => assert(data[1].some((item) => item.midPx === null)),
        );
    });
});
