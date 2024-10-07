import { type Hex, InfoClient } from "../../index.ts";
import { assertJsonSchema } from "../utils.ts";
import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.2";
import { assert } from "jsr:@std/assert@^1.0.4";

const USER_ADDRESS: Hex = "0x563C175E6f11582f65D6d9E360A618699DEe14a9";

Deno.test(
    "subAccounts",
    { permissions: { net: true, read: true } },
    async (t) => {
        // Create client
        const client = new InfoClient("https://api.hyperliquid-testnet.xyz/info");

        // Create TypeScript type schemas
        const tsjSchemaGenerator = tsj.createGenerator({ path: resolve("./src/types/info.d.ts"), skipTypeCheck: true });
        const schema = tsjSchemaGenerator.createSchema("SubAccount");

        // Test
        const data = await client.subAccounts({ user: USER_ADDRESS });

        assert(Array.isArray(data), "WARNING: Unable to fully validate the type due to an empty array");
        data.forEach((item) => assertJsonSchema(schema, item));

        await t.step("clearinghouseState", async (t) => {
            await t.step("assetPositions[].position.leverage", async (t) => {
                await t.step("type === isolated", () => {
                    assert(
                        data.find((item) =>
                            item.clearinghouseState.assetPositions.find((item) => item.position.leverage.type === "isolated")
                        ),
                    );
                });

                await t.step("type === cross", () => {
                    assert(
                        data.find((item) =>
                            item.clearinghouseState.assetPositions.find((item) => item.position.leverage.type === "cross")
                        ),
                    );
                });
            });

            await t.step("assetPositions[].position.liquidationPx", async (t) => {
                await t.step("typeof liquidationPx === string", () => {
                    assert(
                        data.find((item) =>
                            item.clearinghouseState.assetPositions.find((item) => typeof item.position.liquidationPx === "string")
                        ),
                    );
                });

                await t.step("liquidationPx === null", () => {
                    assert(
                        data.find((item) =>
                            item.clearinghouseState.assetPositions.find((item) => item.position.liquidationPx === null)
                        ),
                    );
                });
            });
        });

        await t.step("spotState.balances.length > 0", () => {
            assert(data.find((item) => item.spotState.balances.length > 0));
        });
    },
);
