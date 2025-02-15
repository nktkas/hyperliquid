import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { fromFileUrl } from "jsr:@std/path@^1.0.8/from-file-url";
import { assert } from "jsr:@std/assert@^1.0.10";
import { HttpTransport, PublicClient } from "../../../mod.ts";
import { assertJsonSchema } from "../../utils.ts";

// —————————— Constants ——————————

const USER_ADDRESS = "0x563C175E6f11582f65D6d9E360A618699DEe14a9";

// —————————— Type schema ——————————

export type MethodReturnType = ReturnType<PublicClient["userTwapSliceFillsByTime"]>;
const MethodReturnType = tsj
    .createGenerator({ path: fromFileUrl(import.meta.url), skipTypeCheck: true })
    .createSchema("MethodReturnType");

// —————————— Test ——————————

Deno.test("userTwapSliceFillsByTime", async (t) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // —————————— Prepare ——————————

    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const client = new PublicClient({ transport });

    // —————————— Test ——————————

    const data = await client.userTwapSliceFillsByTime({
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
                await t.step("Check key 'side'", async (t) => {
                    await t.step("some should be 'B'", () => {
                        assert(data.some((userTwapSliceFill) => userTwapSliceFill.fill.side === "B"));
                    });
                    await t.step("some should be 'A'", () => {
                        assert(data.some((userTwapSliceFill) => userTwapSliceFill.fill.side === "A"));
                    });
                });
            });

            await t.step("Check arguments", async (t) => {
                await t.step("Check argument 'endTime'", async () => {
                    const data = await client.userTwapSliceFillsByTime({
                        user: USER_ADDRESS,
                        startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
                        endTime: Date.now(),
                    });
                    assertJsonSchema(MethodReturnType, data);
                });

                await t.step("Check argument 'aggregateByTime'", async (t) => {
                    await t.step("aggregateByTime: true", async () => {
                        const data = await client.userTwapSliceFillsByTime({
                            user: USER_ADDRESS,
                            startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
                            aggregateByTime: true,
                        });
                        assertJsonSchema(MethodReturnType, data);
                    });
                    await t.step("aggregateByTime: false", async () => {
                        const data = await client.userTwapSliceFillsByTime({
                            user: USER_ADDRESS,
                            startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
                            aggregateByTime: false,
                        });
                        assertJsonSchema(MethodReturnType, data);
                    });
                    await t.step("aggregateByTime: undefined", async () => {
                        const data = await client.userTwapSliceFillsByTime({
                            user: USER_ADDRESS,
                            startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
                            aggregateByTime: undefined,
                        });
                        assertJsonSchema(MethodReturnType, data);
                    });
                });
            });
        },
        ignore: !isMatchToScheme,
    });
});
