import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { assert } from "jsr:@std/assert@^1.0.10";
import { HttpTransport, PublicClient } from "../../../index.ts";
import { assertJsonSchema } from "../../utils.ts";

const USER_ADDRESS = "0x563C175E6f11582f65D6d9E360A618699DEe14a9";

Deno.test("clearinghouseState", async (t) => {
    // Create a scheme of type
    const typeSchema = tsj
        .createGenerator({ path: "./index.ts", skipTypeCheck: true })
        .createSchema("ClearinghouseState");

    // Create client
    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const client = new PublicClient({ transport });

    // Test
    const data = await client.clearinghouseState({ user: USER_ADDRESS });

    const isMatchToScheme = await t.step("Matching data to type schema", () => {
        assertJsonSchema(typeSchema, data);
    });

    await t.step({
        name: "Additional checks",
        fn: async (t) => {
            await t.step("Check key 'assetPositions'", async (t) => {
                assert(data.assetPositions.length > 0, "'assetPositions' must be a non-empty array");

                await t.step("Check key 'leverage'", async (t) => {
                    await t.step(
                        "some must be 'isolated'",
                        () => assert(data.assetPositions.some((item) => item.position.leverage.type === "isolated")),
                    );
                    await t.step(
                        "some must be 'cross'",
                        () => assert(data.assetPositions.some((item) => item.position.leverage.type === "cross")),
                    );
                });

                await t.step("Check key 'liquidationPx'", async (t) => {
                    await t.step(
                        "some must be a string",
                        () =>
                            assert(data.assetPositions.some((item) => typeof item.position.liquidationPx === "string")),
                    );
                    await t.step(
                        "some must be null",
                        () => assert(data.assetPositions.some((item) => item.position.liquidationPx === null)),
                    );
                });
            });
        },
        ignore: !isMatchToScheme,
    });
});
