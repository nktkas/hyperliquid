import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { assert } from "jsr:@std/assert@^1.0.10";
import { HttpTransport, PublicClient, type VaultDetails } from "../../../index.ts";
import { assertJsonSchema } from "../../utils.ts";

const INVALID_VAULT_ADDRESS = "0x0000000000000000000000000000000000000000";
const VAULT_ADDRESS_WITH_NORMAL_RELATIONSHIP = "0x1719884eb866cb12b2287399b15f7db5e7d775ea";
const VAULT_ADDRESS_WITH_PARENT_RELATIONSHIP = "0xe51298d7f010e548368593b6f98c60c675ef88c4";

Deno.test("vaultDetails", async (t) => {
    // Create a scheme of type
    const typeSchema = tsj
        .createGenerator({ path: "./index.ts", skipTypeCheck: true })
        .createSchema("VaultDetails");

    // Create client
    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const client = new PublicClient({ transport });

    //Test
    const isMatchToScheme = await t.step("Matching data to type schema", async (t) => {
        await t.step("response must be an object", async () => {
            const data = await client.vaultDetails({ vaultAddress: VAULT_ADDRESS_WITH_NORMAL_RELATIONSHIP });
            assertJsonSchema(typeSchema, data);
            assert(typeof data === "object" && data !== null);
        });

        await t.step("response must be null", async () => {
            const data = await client.vaultDetails({ vaultAddress: INVALID_VAULT_ADDRESS });
            assert(data === null);
        });
    });

    await t.step({
        name: "Additional checks",
        fn: async (t) => {
            await t.step("Check keys", async (t) => {
                const data = await client.vaultDetails({ vaultAddress: VAULT_ADDRESS_WITH_NORMAL_RELATIONSHIP });
                assertJsonSchema(typeSchema, data);
                assert(typeof data === "object" && data !== null);

                await t.step("Check key 'portfolio'", async (t) => {
                    assert(data.portfolio.length > 0, "must be an array with at least one element");

                    await t.step("Check key 'portfolio[][0]'", async (t) => {
                        await t.step("must include 'day'", () => {
                            assert(data.portfolio.some(([t]) => t === "day"));
                        });
                        await t.step("must include 'week'", () => {
                            assert(data.portfolio.some(([t]) => t === "week"));
                        });
                        await t.step("must include 'month'", () => {
                            assert(data.portfolio.some(([t]) => t === "month"));
                        });
                        await t.step("must include 'allTime'", () => {
                            assert(data.portfolio.some(([t]) => t === "allTime"));
                        });
                        await t.step("must include 'perpDay'", () => {
                            assert(data.portfolio.some(([t]) => t === "perpDay"));
                        });
                        await t.step("must include 'perpWeek'", () => {
                            assert(data.portfolio.some(([t]) => t === "perpWeek"));
                        });
                        await t.step("must include 'perpMonth'", () => {
                            assert(data.portfolio.some(([t]) => t === "perpMonth"));
                        });
                        await t.step("must include 'perpAllTime'", () => {
                            assert(data.portfolio.some(([t]) => t === "perpAllTime"));
                        });
                    });

                    await t.step("Check key 'portfolio[][1]'", async (t) => {
                        await t.step("Check keys 'accountValueHistory'", () => {
                            assert(
                                data.portfolio.every(([, { accountValueHistory }]) =>
                                    accountValueHistory.every(([a, b]) =>
                                        typeof a === "number" && typeof b === "string"
                                    )
                                ),
                                "all elements of 'accountValueHistory' must be an array of tuples [number, string]",
                            );
                        });

                        await t.step("Check keys 'pnlHistory'", () => {
                            assert(
                                data.portfolio.every(([, { pnlHistory }]) =>
                                    pnlHistory.every(([a, b]) => typeof a === "number" && typeof b === "string")
                                ),
                                "all elements of 'pnlHistory' must be an array of tuples [number, string]",
                            );
                        });
                    });
                });

                await t.step("Check key 'followerState'", async (t) => {
                    await t.step("must be null", () => assert(data.followerState === null));

                    // Failed to find a vault with `followerState !== null`
                    await t.step({ name: "must not be null", fn: () => {}, ignore: true });
                });

                await t.step("Check key 'followers[].user'", async (t) => {
                    await t.step("some must be 'Leader'", () => {
                        assert(data.followers.some(({ user }) => user === "Leader"));
                    });
                    await t.step("some must be Hex", () => {
                        assert(data.followers.some(({ user }) => user.startsWith("0x")));
                    });
                });

                await t.step("Check key 'relationship'", async (t) => {
                    await t.step("must include 'normal'", async () => {
                        const data = await client.vaultDetails({
                            vaultAddress: VAULT_ADDRESS_WITH_NORMAL_RELATIONSHIP,
                        });
                        assertJsonSchema<VaultDetails>(typeSchema, data);
                        assert(
                            data.relationship.type === "normal",
                            "Expected 'relationship.type' to be 'normal', but got: " + data.relationship.type,
                        );
                    });
                    await t.step("must include 'parent'", async () => {
                        const data = await client.vaultDetails({
                            vaultAddress: VAULT_ADDRESS_WITH_PARENT_RELATIONSHIP,
                        });
                        assertJsonSchema<VaultDetails>(typeSchema, data);
                        assert(
                            data.relationship.type === "normal",
                            "Expected 'relationship.type' to be 'normal', but got: " + data.relationship.type,
                        );
                    });
                });
            });

            await t.step("Check arguments", async (t) => {
                await t.step("Check argument 'user'", async () => {
                    const data = await client.vaultDetails({
                        vaultAddress: VAULT_ADDRESS_WITH_NORMAL_RELATIONSHIP,
                        user: VAULT_ADDRESS_WITH_NORMAL_RELATIONSHIP,
                    });
                    assertJsonSchema(typeSchema, data);
                });
            });
        },
        ignore: !isMatchToScheme,
    });
});
