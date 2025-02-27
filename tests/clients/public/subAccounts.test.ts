import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { fromFileUrl } from "jsr:@std/path@^1.0.8/from-file-url";
import { assert } from "jsr:@std/assert@^1.0.10";
import { HttpTransport, PublicClient } from "../../../mod.ts";
import { assertJsonSchema } from "../../utils.ts";

// —————————— Constants ——————————

const USER_ADDRESS = "0x563C175E6f11582f65D6d9E360A618699DEe14a9";
const USER_ADDRESS_WITHOUT_SUBACCOUNTS = "0x0000000000000000000000000000000000000000";

// —————————— Type schema ——————————

export type MethodReturnType = ReturnType<PublicClient["subAccounts"]>;
const MethodReturnType = tsj
    .createGenerator({ path: fromFileUrl(import.meta.url), skipTypeCheck: true })
    .createSchema("MethodReturnType");

// —————————— Test ——————————

Deno.test("subAccounts", async (t) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // —————————— Prepare ——————————

    const transport = new HttpTransport({ isTestnet: true });
    const client = new PublicClient({ transport });

    // —————————— Test ——————————

    const isMatchToScheme = await t.step("Matching data to type schema", async (t) => {
        await t.step("response should be an 'array'", async () => {
            const data = await client.subAccounts({ user: USER_ADDRESS });
            assertJsonSchema(MethodReturnType, data);
            assert(Array.isArray(data), `Expected data to be an 'array', got '${typeof data}'`);
        });
        await t.step("response should be 'null'", async () => {
            const data = await client.subAccounts({ user: USER_ADDRESS_WITHOUT_SUBACCOUNTS });
            // NOTE: tsj does not return a null schema
            // assertJsonSchema(MethodReturnType, data);
            assert(data === null, `Expected data to be 'null', got '${typeof data}'`);
        });
    });

    await t.step({
        name: "Additional checks",
        fn: async (t) => {
            const data = await client.subAccounts({ user: USER_ADDRESS });
            assertJsonSchema(MethodReturnType, data);

            await t.step("Check key 'clearinghouseState.assetPositions'", async (t) => {
                assert(
                    data.some((item) => item.clearinghouseState.assetPositions.length > 0),
                    "some 'assetPositions' should be a non-empty array",
                );

                await t.step("Check key 'leverage'", async (t) => {
                    await t.step("some should be 'isolated'", () => {
                        assert(
                            data.some((x) =>
                                x.clearinghouseState.assetPositions.some((y) => y.position.leverage.type === "isolated")
                            ),
                        );
                    });
                    await t.step("some should be 'cross'", () => {
                        assert(
                            data.some((x) =>
                                x.clearinghouseState.assetPositions.some((y) => y.position.leverage.type === "cross")
                            ),
                        );
                    });
                });

                await t.step("Check key 'liquidationPx'", async (t) => {
                    await t.step("some should be a 'string'", () => {
                        assert(
                            data.some((item) =>
                                item.clearinghouseState.assetPositions.some((item) =>
                                    typeof item.position.liquidationPx === "string"
                                )
                            ),
                        );
                    });
                    await t.step("some should be 'null'", () => {
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
        },
        ignore: !isMatchToScheme,
    });
});
