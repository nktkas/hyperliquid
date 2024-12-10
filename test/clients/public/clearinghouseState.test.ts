import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.2";
import { assert, assertGreater } from "jsr:@std/assert@^1.0.9";
import { HttpTransport, PublicClient } from "../../../index.ts";
import { assertJsonSchema } from "../../utils.ts";

const USER_ADDRESS = "0x563C175E6f11582f65D6d9E360A618699DEe14a9";

Deno.test("clearinghouseState", async (t) => {
    // Create TypeScript type schemas
    const tsjSchemaGenerator = tsj.createGenerator({ path: resolve("./index.ts"), skipTypeCheck: true });
    const schema = tsjSchemaGenerator.createSchema("ClearinghouseState");

    // Create client
    const client = new PublicClient(new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" }));

    // Test
    const data = await client.clearinghouseState({ user: USER_ADDRESS });
    assertJsonSchema(schema, data);
    assertGreater(data.assetPositions.length, 0);
    await t.step("validating assetPositions", async (t) => {
        await t.step("leverage", async (t) => {
            await t.step(
                "some should be isolated",
                () => assert(data.assetPositions.some((item) => item.position.leverage.type === "isolated")),
            );
            await t.step(
                "some should be cross",
                () => assert(data.assetPositions.some((item) => item.position.leverage.type === "cross")),
            );
        });
        await t.step("liquidationPx", async (t) => {
            await t.step(
                "some should be string",
                () => assert(data.assetPositions.some((item) => typeof item.position.liquidationPx === "string")),
            );
            await t.step(
                "some should be null",
                () => assert(data.assetPositions.some((item) => item.position.liquidationPx === null)),
            );
        });
    });
});
