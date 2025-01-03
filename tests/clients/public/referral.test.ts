import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { assert } from "jsr:@std/assert@^1.0.10";
import { HttpTransport, PublicClient } from "../../../index.ts";
import { assertJsonSchema } from "../../utils.ts";

const NON_REFERRED = "0x0000000000000000000000000000000000000000";
const REFERRED = "0x091288cd1e81e065d1541ec73dd0dfdde2f529fa";
const STATE_READY = "0xe019d6167E7e324aEd003d94098496b6d986aB05";
const STATE_NEED_TO_CREATE_CODE = "0x97c36726668f490fa17eb2957a92D39116f171fE";
const STATE_NEED_TO_TRADE = "0x0000000000000000000000000000000000000000";
const REWARD_HISTORY = "0x745d208c08be6743481cdaf5984956be87ec5a3f"; // Mainnet

Deno.test("referral", async (t) => {
    // Create a scheme of type
    const typeSchema = tsj
        .createGenerator({ path: "./index.ts", skipTypeCheck: true })
        .createSchema("Referral");

    // Create client
    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const client = new PublicClient({ transport });

    //Test
    const isMatchToScheme = await t.step("Matching data to type schema", async () => {
        const data = await client.referral({ user: REFERRED });
        assertJsonSchema(typeSchema, data);
    });

    await t.step({
        name: "Additional checks",
        fn: async (t) => {
            await t.step("Check key 'referredBy'", async (t) => {
                await t.step("must be null", async () => {
                    const data = await client.referral({ user: NON_REFERRED });
                    assertJsonSchema(typeSchema, data);
                    assert(
                        data.referredBy === null,
                        "'referredBy' must be null, but got: " + data.referredBy,
                    );
                });
                await t.step("must be an object", async () => {
                    const data = await client.referral({ user: REFERRED });
                    assertJsonSchema(typeSchema, data);
                    assert(
                        typeof data.referredBy === "object" && data.referredBy !== null,
                        "'referredBy' must be an object, but got: " + data.referredBy,
                    );
                });
            });

            await t.step("Check key 'referrerState'", async (t) => {
                await t.step("Check key 'stage'", async (t) => {
                    await t.step("must be 'ready'", async () => {
                        const data = await client.referral({ user: STATE_READY });
                        assertJsonSchema(typeSchema, data);
                        assert(
                            data.referrerState.stage === "ready",
                            "stage must be 'ready', but got: " + data.referrerState.stage,
                        );
                        assert(
                            data.referrerState.data.referralStates.length > 0,
                            "'referralStates' must be a non-empty array",
                        );
                    });
                    await t.step("must be 'needToCreateCode'", async () => {
                        const data = await client.referral({ user: STATE_NEED_TO_CREATE_CODE });
                        assertJsonSchema(typeSchema, data);
                        assert(
                            data.referrerState.stage === "needToCreateCode",
                            "stage must be 'needToCreateCode', but got: " + data.referrerState.stage,
                        );
                    });
                    await t.step("must be 'needToTrade'", async () => {
                        const data = await client.referral({ user: STATE_NEED_TO_TRADE });
                        assertJsonSchema(typeSchema, data);
                        assert(
                            data.referrerState.stage === "needToTrade",
                            "stage must be 'needToTrade', but got: " + data.referrerState.stage,
                        );
                    });
                });
            });

            await t.step("Check key 'rewardHistory'", async (t) => {
                await t.step("must be an array", async () => {
                    // Failed to find a user with `rewardHistory` in Testnet
                    const transport = new HttpTransport();
                    const client = new PublicClient({ transport });

                    const data = await client.referral({ user: REWARD_HISTORY });
                    assertJsonSchema(typeSchema, data);
                    assert(data.rewardHistory.length > 0, "'rewardHistory' must be a non-empty array");
                });
            });
        },
        ignore: !isMatchToScheme,
    });
});
