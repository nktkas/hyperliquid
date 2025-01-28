import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { fromFileUrl } from "jsr:@std/path@^1.0.8/from-file-url";
import { assert } from "jsr:@std/assert@^1.0.10";
import { HttpTransport, PublicClient } from "../../../mod.ts";
import { assertJsonSchema } from "../../utils.ts";

// —————————— Constants ——————————

const USER_ADDRESS = "0x563C175E6f11582f65D6d9E360A618699DEe14a9";

// —————————— Type schema ——————————

export type MethodReturnType = ReturnType<PublicClient["userFunding"]>;
const MethodReturnType = tsj
    .createGenerator({ path: fromFileUrl(import.meta.url), skipTypeCheck: true })
    .createSchema("MethodReturnType");

// —————————— Test ——————————

Deno.test("userFunding", async (t) => {
    // —————————— Prepare ——————————

    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const client = new PublicClient({ transport });

    // —————————— Test ——————————

    const data = await client.userFunding({
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
                await t.step("Check key 'delta.nSamples'", async (t) => {
                    await t.step("some should be a 'number'", () => {
                        assert(data.some((item) => typeof item.delta.nSamples === "number"));
                    });
                    await t.step("some should be 'null'", () => {
                        assert(data.some((item) => item.delta.nSamples === null));
                    });
                });
            });

            await t.step("Check arguments", async (t) => {
                await t.step("Check argument 'endTime'", async (t) => {
                    await t.step("endTime: Date.now()", async () => {
                        const data = await client.userFunding({
                            user: USER_ADDRESS,
                            startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
                            endTime: Date.now(),
                        });
                        assertJsonSchema(MethodReturnType, data);
                    });
                    await t.step("endTime: null", async () => {
                        const data = await client.userFunding({
                            user: USER_ADDRESS,
                            startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
                            endTime: null,
                        });
                        assertJsonSchema(MethodReturnType, data);
                    });
                    await t.step("endTime: undefined", async () => {
                        const data = await client.userFunding({
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
