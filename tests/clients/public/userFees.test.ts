import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { assert } from "jsr:@std/assert@^1.0.10";
import { HttpTransport, PublicClient } from "../../../mod.ts";
import { assertJsonSchema } from "../../utils.ts";

// —————————— Constants ——————————

const USER_ADDRESS = "0xe973105a27e17350500926ae664dfcfe6006d924";

// —————————— Type schema ——————————

export type MethodReturnType = ReturnType<PublicClient["userFees"]>;
const MethodReturnType = tsj
    .createGenerator({ path: import.meta.url, skipTypeCheck: true })
    .createSchema("MethodReturnType");

// —————————— Test ——————————

Deno.test("userFees", async (t) => {
    // —————————— Prepare ——————————

    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const client = new PublicClient({ transport });

    // —————————— Test ——————————

    const data = await client.userFees({ user: USER_ADDRESS });

    const isMatchToScheme = await t.step("Matching data to type schema", () => {
        assertJsonSchema(MethodReturnType, data);
    });

    await t.step({
        name: "Additional checks",
        fn: async (t) => {
            await t.step("Check key 'dailyUserVlm'", () => {
                assert(data.dailyUserVlm.length > 0, "'dailyUserVlm' should be a non-empty array");
            });

            await t.step("Check key 'feeSchedule.tiers'", async (t) => {
                await t.step("Check key 'vip'", () => {
                    assert(data.feeSchedule.tiers.vip.length > 0, "'vip' should be a non-empty array");
                });
                await t.step("Check key 'mm'", () => {
                    assert(data.feeSchedule.tiers.vip.length > 0, "'vip' should be a non-empty array");
                });
            });

            await t.step("Check key 'trial'", async (t) => {
                await t.step("should be 'null'", () => {
                    assert(data.trial === null);
                });

                // Failed to find a user with 'trial !== null'
                await t.step({ name: "should not be 'null'", fn: () => {}, ignore: true });
            });

            await t.step("Check key 'nextTrialAvailableTimestamp'", async (t) => {
                await t.step("should be 'null'", () => {
                    assert(data.nextTrialAvailableTimestamp === null);
                });

                // Failed to find a user with 'nextTrialAvailableTimestamp !== null'
                await t.step({ name: "should not be 'null'", fn: () => {}, ignore: true });
            });
        },
        ignore: !isMatchToScheme,
    });
});
