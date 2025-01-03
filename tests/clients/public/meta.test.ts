import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { assert } from "jsr:@std/assert@^1.0.10";
import { HttpTransport, PublicClient } from "../../../index.ts";
import { assertJsonSchema } from "../../utils.ts";

Deno.test("meta", async (t) => {
    // Create a scheme of type
    const typeSchema = tsj
        .createGenerator({ path: "./index.ts", skipTypeCheck: true })
        .createSchema("Meta");

    // Create client
    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const client = new PublicClient({ transport });

    //Test
    const data = await client.meta();

    const isMatchToScheme = await t.step("Matching data to type schema", () => {
        assertJsonSchema(typeSchema, data);
    });

    await t.step({
        name: "Additional checks",
        fn: async (t) => {
            await t.step("Check key 'universe'", async (t) => {
                assert(data.universe.length > 0, "'universe' must be a non-empty array");

                await t.step("Check key 'onlyIsolated'", async (t) => {
                    await t.step(
                        "some must be true",
                        () => assert(data.universe.some((item) => item.onlyIsolated === true)),
                    );
                    await t.step(
                        "some must be undefined",
                        () => assert(data.universe.some((item) => item.onlyIsolated === undefined)),
                    );
                });
            });
        },
        ignore: !isMatchToScheme,
    });
});
