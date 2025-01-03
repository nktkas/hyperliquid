import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { assert, assertGreater } from "jsr:@std/assert@^1.0.10";
import { HttpTransport, PublicClient } from "../../../index.ts";
import { assertJsonSchema } from "../../utils.ts";

const USER_ADDRESS = "0x563C175E6f11582f65D6d9E360A618699DEe14a9";
const USER_ADDRESS_WITHOUT_SUBACCOUNTS = "0x0000000000000000000000000000000000000000";

Deno.test("subAccounts", async (t) => {
    // Create a scheme of type
    const typeSchema = tsj
        .createGenerator({ path: "./index.ts", skipTypeCheck: true })
        .createSchema("SubAccount");

    // Create client
    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const client = new PublicClient({ transport });

    //Test
    const data = await client.subAccounts({ user: USER_ADDRESS });

    const isMatchToScheme = await t.step("Matching data to type schema", async (t) => {
        await t.step("response must be an array", () => {
            assert(Array.isArray(data), "Expected data to be an array, but got: " + typeof data);
            assertGreater(data.length, 0, "Expected data to have at least one element");
            data.forEach((item) => assertJsonSchema(typeSchema, item));
        });
        await t.step("response must be null", async () => {
            const data = await client.subAccounts({ user: USER_ADDRESS_WITHOUT_SUBACCOUNTS });
            assert(data === null, "Expected data to be null, but got: " + typeof data);
        });
    });

    await t.step({
        name: "Additional checks",
        fn: async (t) => {
            assert(Array.isArray(data), "Expected data to be an array, but got: " + typeof data);

            await t.step("Check key 'clearinghouseState.assetPositions'", async (t) => {
                assert(
                    data.some((item) => item.clearinghouseState.assetPositions.length > 0),
                    "some 'assetPositions' must be a non-empty array",
                );

                await t.step("Check key 'leverage'", async (t) => {
                    await t.step("some must be 'isolated'", () => {
                        assert(
                            data.some((x) =>
                                x.clearinghouseState.assetPositions.some((y) => y.position.leverage.type === "isolated")
                            ),
                        );
                    });
                    await t.step("some must be 'cross'", () => {
                        assert(
                            data.some((x) =>
                                x.clearinghouseState.assetPositions.some((y) => y.position.leverage.type === "cross")
                            ),
                        );
                    });
                });

                await t.step("Check key 'liquidationPx'", async (t) => {
                    await t.step("some must be a string", () => {
                        assert(
                            data.some((item) =>
                                item.clearinghouseState.assetPositions.some((item) =>
                                    typeof item.position.liquidationPx === "string"
                                )
                            ),
                        );
                    });
                    await t.step("some must be null", () => {
                        assert(
                            data.some((item) =>
                                item.clearinghouseState.assetPositions.some((item) =>
                                    item.position.liquidationPx === null
                                )
                            ),
                        );
                    });
                });
            });

            await t.step("Check key 'spotState.balances'", async (t) => {
                await t.step("some must be a non-empty array", () => {
                    assert(data.some((x) => x.spotState.balances.length > 0));
                });
            });
        },
        ignore: !isMatchToScheme,
    });
});
