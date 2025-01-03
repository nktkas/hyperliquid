import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { assert, assertGreater } from "jsr:@std/assert@^1.0.10";
import { HttpTransport, PublicClient } from "../../../index.ts";
import { assertJsonSchema } from "../../utils.ts";

const USER_ADDRESS = "0x563C175E6f11582f65D6d9E360A618699DEe14a9";

Deno.test("twapHistory", async (t) => {
    // Create a scheme of type
    const typeSchema = tsj
        .createGenerator({ path: "./index.ts", skipTypeCheck: true })
        .createSchema("TwapHistory");

    // Create client
    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const client = new PublicClient({ transport });

    //Test
    const data = await client.twapHistory({ user: USER_ADDRESS });

    const isMatchToScheme = await t.step("Matching data to type schema", () => {
        assertGreater(data.length, 0, "Expected data to have at least one element");
        data.forEach((item) => assertJsonSchema(typeSchema, item));
    });

    await t.step({
        name: "Additional checks",
        fn: async (t) => {
            await t.step("Check key 'state.side'", async (t) => {
                await t.step("some must be B", () => assert(data.some((item) => item.state.side === "B")));
                await t.step("some must be A", () => assert(data.some((item) => item.state.side === "A")));
            });

            await t.step("Check key 'status.status'", async (t) => {
                await t.step(
                    "some must be finished",
                    () => assert(data.some((item) => item.status.status === "finished")),
                );
                await t.step(
                    "some must be activated",
                    () => assert(data.some((item) => item.status.status === "activated")),
                );
                await t.step(
                    "some must be terminated",
                    () => assert(data.some((item) => item.status.status === "terminated")),
                );
                await t.step(
                    "some must be error",
                    () => assert(data.some((item) => item.status.status === "error")),
                );
            });
        },
        ignore: !isMatchToScheme,
    });
});
