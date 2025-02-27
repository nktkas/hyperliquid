import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { fromFileUrl } from "jsr:@std/path@^1.0.8/from-file-url";
import { assert } from "jsr:@std/assert@^1.0.10";
import { HttpTransport, PublicClient } from "../../../mod.ts";
import { assertJsonSchema } from "../../utils.ts";

// —————————— Constants ——————————

const USER_ADDRESS = "0x563C175E6f11582f65D6d9E360A618699DEe14a9";

// —————————— Type schema ——————————

export type MethodReturnType = ReturnType<PublicClient["userNonFundingLedgerUpdates"]>;
const MethodReturnType = tsj
    .createGenerator({ path: fromFileUrl(import.meta.url), skipTypeCheck: true })
    .createSchema("MethodReturnType");

// —————————— Test ——————————

Deno.test("userNonFundingLedgerUpdates", async (t) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // —————————— Prepare ——————————

    const transport = new HttpTransport({ isTestnet: true });
    const client = new PublicClient({ transport });

    // —————————— Test ——————————

    const data = await client.userNonFundingLedgerUpdates({
        user: USER_ADDRESS,
        startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
    });

    const isMatchToScheme = await t.step("Matching data to type schema", () => {
        assertJsonSchema(MethodReturnType, data);
    });

    await t.step({
        name: "Additional checks",
        fn: async (t) => {
            await t.step("Check keys", async (t) => {
                await t.step("Check key 'type'", async (t) => {
                    await t.step("some should be 'accountClassTransfer'", () => {
                        assert(data.some((item) => item.delta.type === "accountClassTransfer"));
                    });
                    await t.step("some should be 'deposit'", () => {
                        assert(data.some((item) => item.delta.type === "deposit"));
                    });
                    await t.step("some should be 'internalTransfer'", () => {
                        assert(data.some((item) => item.delta.type === "internalTransfer"));
                    });
                    await t.step("some should be 'liquidation'", async (t) => {
                        assert(data.some((item) => item.delta.type === "liquidation"));

                        await t.step("Check key 'leverageType'", async (t) => {
                            // FIXME: Need to do a search
                            await t.step({
                                name: "some should be 'Cross'",
                                fn: () => {
                                    assert(data.some((item) =>
                                        item.delta.type === "liquidation" &&
                                        item.delta.leverageType === "Cross"
                                    ));
                                },
                                ignore: true,
                            });
                            await t.step("some should be 'Isolated'", () => {
                                assert(data.some((item) =>
                                    item.delta.type === "liquidation" &&
                                    item.delta.leverageType === "Isolated"
                                ));
                            });
                        });
                    });
                    await t.step("some should be 'rewardsClaim'", () => {
                        assert(data.some((item) => item.delta.type === "rewardsClaim"));
                    });
                    await t.step("some should be 'spotTransfer'", () => {
                        assert(data.some((item) => item.delta.type === "spotTransfer"));
                    });
                    await t.step("some should be 'subAccountTransfer'", () => {
                        assert(data.some((item) => item.delta.type === "subAccountTransfer"));
                    });
                    await t.step("some should be 'vaultCreate'", () => {
                        assert(data.some((item) => item.delta.type === "vaultCreate"));
                    });
                    await t.step("some should be 'vaultDeposit'", () => {
                        assert(data.some((item) => item.delta.type === "vaultDeposit"));
                    });
                    await t.step("some should be 'vaultDistribution'", () => {
                        assert(data.some((item) => item.delta.type === "vaultDistribution"));
                    });
                    await t.step("some should be 'vaultWithdraw'", () => {
                        assert(data.some((item) => item.delta.type === "vaultWithdraw"));
                    });
                    await t.step("some should be 'withdraw'", () => {
                        assert(data.some((item) => item.delta.type === "withdraw"));
                    });
                });
            });

            await t.step("Check arguments", async (t) => {
                await t.step("Check argument 'endTime'", async (t) => {
                    await t.step("endTime: Date.now()", async () => {
                        const data = await client.userNonFundingLedgerUpdates({
                            user: USER_ADDRESS,
                            startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
                            endTime: Date.now(),
                        });
                        assertJsonSchema(MethodReturnType, data);
                    });
                    await t.step("endTime: null", async () => {
                        const data = await client.userNonFundingLedgerUpdates({
                            user: USER_ADDRESS,
                            startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
                            endTime: null,
                        });
                        assertJsonSchema(MethodReturnType, data);
                    });
                    await t.step("endTime: undefined", async () => {
                        const data = await client.userNonFundingLedgerUpdates({
                            user: USER_ADDRESS,
                            startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
                            endTime: undefined,
                        });
                        assertJsonSchema(MethodReturnType, data);
                    });
                });
            });
        },
        ignore: !isMatchToScheme,
    });
});
