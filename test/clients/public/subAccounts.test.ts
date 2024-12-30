import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.2";
import { assert, assertGreater } from "jsr:@std/assert@^1.0.9";
import { HttpTransport, PublicClient } from "../../../index.ts";
import { assertJsonSchema } from "../../utils.ts";

const USER_ADDRESS = "0x563C175E6f11582f65D6d9E360A618699DEe14a9";

Deno.test("subAccounts", async (t) => {
    // Create TypeScript type schemas
    const tsjSchemaGenerator = tsj.createGenerator({ path: resolve("./index.ts"), skipTypeCheck: true });
    const schema = tsjSchemaGenerator.createSchema("SubAccount");

    // Create client
    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const client = new PublicClient({ transport });

    //Test
    const data = await client.subAccounts({ user: USER_ADDRESS });

    assertGreater(data.length, 0, "Unable to fully validate the type due to an empty array");
    data.forEach((item) => assertJsonSchema(schema, item));

    await t.step("clearinghouseState", async (t) => {
        await t.step("leverage in assetPositions[].position", async (t) => {
            await t.step("some should be isolated", () => {
                assert(
                    data.some((item) =>
                        item.clearinghouseState.assetPositions.some((item) =>
                            item.position.leverage.type === "isolated"
                        )
                    ),
                );
            });

            await t.step("some should be cross", () => {
                assert(
                    data.some((item) =>
                        item.clearinghouseState.assetPositions.some((item) => item.position.leverage.type === "cross")
                    ),
                );
            });
        });

        await t.step("liquidationPx in assetPositions[].position", async (t) => {
            await t.step("some should be string", () => {
                assert(
                    data.some((item) =>
                        item.clearinghouseState.assetPositions.some((item) =>
                            typeof item.position.liquidationPx === "string"
                        )
                    ),
                );
            });

            await t.step("some should be null", () => {
                assert(
                    data.some((item) =>
                        item.clearinghouseState.assetPositions.some((item) => item.position.liquidationPx === null)
                    ),
                );
            });
        });
    });

    await t.step("spotState.balances should be greater than 0", () => {
        assert(data.some((item) => item.spotState.balances.length > 0));
    });
});
