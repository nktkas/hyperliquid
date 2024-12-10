import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.2";
import { assert } from "jsr:@std/assert@^1.0.9";
import { HttpTransport, PublicClient } from "../../../index.ts";
import { assertIncludesNotEmptyArray, assertJsonSchema } from "../../utils.ts";

Deno.test("spotMeta", async (t) => {
    // Create TypeScript type schemas
    const tsjSchemaGenerator = tsj.createGenerator({ path: resolve("./index.ts"), skipTypeCheck: true });
    const schema = tsjSchemaGenerator.createSchema("SpotMeta");

    // Create client
    const client = new PublicClient(new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" }));

    //Test
    const data = await client.spotMeta();

    assertJsonSchema(schema, data);
    assertIncludesNotEmptyArray(data);

    await t.step("tokens[].evmContract", async (t) => {
        await t.step("some should be null", () => assert(data.tokens.some((item) => item.evmContract === null)));
        await t.step("some should not be null", () => assert(data.tokens.some((item) => item.evmContract !== null)));
    });

    await t.step("tokens[].fullName", async (t) => {
        await t.step(
            "some should be null",
            () => assert(data.tokens.some((item) => item.fullName === null)),
        );
        await t.step(
            "some should be string",
            () => assert(data.tokens.some((item) => typeof item.fullName === "string")),
        );
    });
});
