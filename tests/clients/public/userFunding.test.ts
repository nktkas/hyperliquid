import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { assert, assertGreater } from "jsr:@std/assert@^1.0.10";
import { HttpTransport, PublicClient } from "../../../index.ts";
import { assertJsonSchema } from "../../utils.ts";

const USER_ADDRESS = "0x563C175E6f11582f65D6d9E360A618699DEe14a9";

Deno.test("userFunding", async (t) => {
    // Create a scheme of type
    const typeSchema = tsj
        .createGenerator({ path: "./index.ts", skipTypeCheck: true })
        .createSchema("UserFunding");

    // Create client
    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const client = new PublicClient({ transport });

    //Test
    const data = await client.userFunding({
        user: USER_ADDRESS,
        startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
    });

    const isMatchToScheme = await t.step("Matching data to type schema", () => {
        assertGreater(data.length, 0, "Expected data to have at least one element");
        data.forEach((item) => assertJsonSchema(typeSchema, item));
    });

    await t.step({
        name: "Additional checks",
        fn: async (t) => {
            await t.step("Check keys", async (t) => {
                await t.step("Check key 'nSamples'", async (t) => {
                    await t.step("some must be a number", () => {
                        assert(data.some((item) => typeof item.delta.nSamples === "number"));
                    });
                    await t.step("some must be null", () => {
                        assert(data.some((item) => item.delta.nSamples === null));
                    });
                });
            });

            await t.step("Check arguments", async (t) => {
                await t.step("Check argument 'endTime'", async () => {
                    const data = await client.userFunding({
                        user: USER_ADDRESS,
                        startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
                        endTime: Date.now(),
                    });
                    assertGreater(data.length, 0, "Expected data to have at least one element");
                    data.forEach((item) => assertJsonSchema(typeSchema, item));
                });
            });
        },
        ignore: !isMatchToScheme,
    });
});
