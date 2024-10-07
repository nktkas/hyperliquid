import { type Hex, InfoClient } from "../../index.ts";
import { assertJsonSchema } from "../utils.ts";
import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.2";
import { assert } from "jsr:@std/assert@^1.0.4";

const USER_ADDRESS: Hex = "0x563C175E6f11582f65D6d9E360A618699DEe14a9";

Deno.test(
    "clearinghouseState",
    { permissions: { net: true, read: true } },
    async (t) => {
        // Create client
        const client = new InfoClient("https://api.hyperliquid-testnet.xyz/info");

        const tsjSchemaGenerator = tsj.createGenerator({
            path: resolve("./src/types/info.d.ts"),
            skipTypeCheck: true,
            topRef: false,
            encodeRefs: false,
        });
        const schema = tsjSchemaGenerator.createSchema("ClearinghouseState");

        // Test
        const data = await client.clearinghouseState({ user: USER_ADDRESS });

        assertJsonSchema(schema, data);

        await t.step("assetPositions", async (t) => {
            await t.step("position.leverage", async (t) => {
                await t.step("type === isolated", () => {
                    assert(data.assetPositions.find((item) => item.position.leverage.type === "isolated"));
                });

                await t.step("type === cross", () => {
                    assert(data.assetPositions.find((item) => item.position.leverage.type === "cross"));
                });
            });

            await t.step("position.liquidationPx", async (t) => {
                await t.step("typeof liquidationPx === string", () => {
                    assert(data.assetPositions.find((item) => typeof item.position.liquidationPx === "string"));
                });

                await t.step("liquidationPx === null", () => {
                    assert(data.assetPositions.find((item) => item.position.liquidationPx === null));
                });
            });
        });
    },
);
