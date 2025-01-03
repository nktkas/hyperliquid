import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { assert } from "jsr:@std/assert@^1.0.10";
import { HttpTransport, PublicClient } from "../../../index.ts";
import { assertIncludesNotEmptyArray, assertJsonSchema } from "../../utils.ts";

const USER_ADDRESS = "0xe973105a27e17350500926ae664dfcfe6006d924";

Deno.test("userFees", async (t) => {
    // Create a scheme of type
    const typeSchema = tsj
        .createGenerator({ path: "./index.ts", skipTypeCheck: true })
        .createSchema("UserFees");

    // Create client
    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const client = new PublicClient({ transport });

    //Test
    const data = await client.userFees({ user: USER_ADDRESS });

    const isMatchToScheme = await t.step("Matching data to type schema", () => {
        assertJsonSchema(typeSchema, data);
        assertIncludesNotEmptyArray(data);
    });

    await t.step({
        name: "Additional checks",
        fn: async (t) => {
            await t.step("Check key 'dailyUserVlm'", () => {
                assert(data.dailyUserVlm.length > 0, "'dailyUserVlm' must be a non-empty array");
            });

            await t.step("Check key 'feeSchedule.tiers'", async (t) => {
                await t.step("Check key 'vip'", () => {
                    assert(data.feeSchedule.tiers.vip.length > 0, "'vip' must be a non-empty array");
                });
                await t.step("Check key 'mm'", () => {
                    assert(data.feeSchedule.tiers.vip.length > 0, "'vip' must be a non-empty array");
                });
            });

            await t.step("Check key 'trial'", async (t) => {
                await t.step("must be null", () => assert(data.trial === null));

                // Failed to find a user with `trial !== null`
                await t.step({ name: "must not be null", fn: () => {}, ignore: true });
            });

            await t.step("Check key 'nextTrialAvailableTimestamp'", async (t) => {
                await t.step("must be null", () => assert(data.nextTrialAvailableTimestamp === null));

                // Failed to find a user with `nextTrialAvailableTimestamp !== null`
                await t.step({ name: "must not be null", fn: () => {}, ignore: true });
            });
        },
        ignore: !isMatchToScheme,
    });
});
