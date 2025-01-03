import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { assert, assertGreater } from "jsr:@std/assert@^1.0.10";
import { HttpTransport, PublicClient } from "../../../index.ts";
import { assertJsonSchema } from "../../utils.ts";

const USER_ADDRESS = "0x563C175E6f11582f65D6d9E360A618699DEe14a9";

Deno.test("openOrders", async (t) => {
    // Create a scheme of type
    const typeSchema = tsj
        .createGenerator({ path: "./index.ts", skipTypeCheck: true })
        .createSchema("OpenOrder");

    // Create client
    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const client = new PublicClient({ transport });

    //Test
    const data = await client.openOrders({ user: USER_ADDRESS });

    const isMatchToScheme = await t.step("Matching data to type schema", () => {
        assertGreater(data.length, 0, "Expected data to have at least one element");
        data.forEach((item) => assertJsonSchema(typeSchema, item));
    });

    await t.step({
        name: "Additional checks",
        fn: async (t) => {
            await t.step("Check key 'side'", async (t) => {
                await t.step("some must be 'B'", () => assert(data.some((item) => item.side === "B")));
                await t.step("some must be 'A'", () => assert(data.some((item) => item.side === "A")));
            });

            await t.step("Check key 'cloid'", async (t) => {
                await t.step(
                    "some must be a string",
                    () => assert(data.some((item) => typeof item.cloid === "string")),
                );
                await t.step(
                    "some must be undefined",
                    () => assert(data.some((item) => item.cloid === undefined)),
                );
            });
        },
        ignore: !isMatchToScheme,
    });
});