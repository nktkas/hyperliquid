import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { assert } from "jsr:@std/assert@^1.0.10";
import { HttpTransport, PublicClient } from "../../../mod.ts";
import { assertJsonSchema } from "../../utils.ts";

// —————————— Constants ——————————

const NON_REFERRED = "0x0000000000000000000000000000000000000000";
const REFERRED = "0x091288cd1e81e065d1541ec73dd0dfdde2f529fa";
const STATE_READY = "0xe019d6167E7e324aEd003d94098496b6d986aB05";
const STATE_NEED_TO_CREATE_CODE = "0x97c36726668f490fa17eb2957a92D39116f171fE";
const STATE_NEED_TO_TRADE = "0x0000000000000000000000000000000000000000";
const REWARD_HISTORY = "0x745d208c08be6743481cdaf5984956be87ec5a3f"; // Mainnet

// —————————— Type schema ——————————

export type MethodReturnType = ReturnType<PublicClient["referral"]>;
const MethodReturnType = tsj
    .createGenerator({ path: import.meta.url, skipTypeCheck: true })
    .createSchema("MethodReturnType");

// —————————— Test ——————————

Deno.test("referral", async (t) => {
    // —————————— Prepare ——————————

    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const client = new PublicClient({ transport });

    // —————————— Test ——————————

    const isMatchToScheme = await t.step("Matching data to type schema", async () => {
        const data = await client.referral({ user: REFERRED });
        assertJsonSchema(MethodReturnType, data, { skipMinItemsCheck: ["rewardHistory"] });
    });

    await t.step({
        name: "Additional checks",
        fn: async (t) => {
            await t.step("Check key 'referredBy'", async (t) => {
                await t.step("should be 'null'", async () => {
                    const data = await client.referral({ user: NON_REFERRED });
                    assertJsonSchema(MethodReturnType, data, { skipMinItemsCheck: ["rewardHistory"] });
                    assert(
                        data.referredBy === null,
                        "'referredBy' should be 'null', but got: " + data.referredBy,
                    );
                });
                await t.step("should be an 'object'", async () => {
                    const data = await client.referral({ user: REFERRED });
                    assertJsonSchema(MethodReturnType, data, { skipMinItemsCheck: ["rewardHistory"] });
                    assert(
                        typeof data.referredBy === "object" && data.referredBy !== null,
                        "'referredBy' should be an 'object', but got: " + data.referredBy,
                    );
                });
            });

            await t.step("Check key 'referrerState'", async (t) => {
                await t.step("Check key 'stage'", async (t) => {
                    await t.step("should be 'ready'", async () => {
                        const data = await client.referral({ user: STATE_READY });
                        assertJsonSchema(MethodReturnType, data, { skipMinItemsCheck: ["rewardHistory"] });
                        assert(
                            data.referrerState.stage === "ready",
                            "stage should be 'ready', but got: " + data.referrerState.stage,
                        );
                    });
                    await t.step("should be 'needToCreateCode'", async () => {
                        const data = await client.referral({ user: STATE_NEED_TO_CREATE_CODE });
                        assertJsonSchema(MethodReturnType, data, { skipMinItemsCheck: ["rewardHistory"] });
                        assert(
                            data.referrerState.stage === "needToCreateCode",
                            "stage should be 'needToCreateCode', but got: " + data.referrerState.stage,
                        );
                    });
                    await t.step("should be 'needToTrade'", async () => {
                        const data = await client.referral({ user: STATE_NEED_TO_TRADE });
                        assertJsonSchema(MethodReturnType, data, { skipMinItemsCheck: ["rewardHistory"] });
                        assert(
                            data.referrerState.stage === "needToTrade",
                            "stage should be 'needToTrade', but got: " + data.referrerState.stage,
                        );
                    });
                });
            });

            await t.step("Check key 'rewardHistory'", async () => {
                // REWARD_HISTORY is required by mainnet
                client.transport.url = "https://api.hyperliquid.xyz";
                const data = await client.referral({ user: REWARD_HISTORY });
                assertJsonSchema(MethodReturnType, data);
            });
        },
        ignore: !isMatchToScheme,
    });
});
