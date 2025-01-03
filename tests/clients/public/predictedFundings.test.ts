import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { assert, assertGreater } from "jsr:@std/assert@^1.0.10";
import { HttpTransport, PublicClient } from "../../../index.ts";
import { assertJsonSchema } from "../../utils.ts";

Deno.test("predictedFundings", async (t) => {
    // Create a scheme of type
    const typeSchema = tsj
        .createGenerator({ path: "./index.ts", skipTypeCheck: true })
        .createSchema("PredictedFunding");

    // Create client
    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const client = new PublicClient({ transport });

    //Test
    const data = await client.predictedFundings();

    const isMatchToScheme = await t.step("Matching data to type schema", () => {
        assertGreater(data.length, 0, "Expected data to have at least one element");
        data.forEach((item) => assertJsonSchema(typeSchema, item));
    });

    await t.step({
        name: "Additional checks",
        fn: async (t) => {
            await t.step("Check key [][1][][1]", async (t) => {
                await t.step(
                    "some must be null",
                    () => assert(data.some(([_, item1]) => item1.some(([_, item2]) => item2 === null))),
                );
                await t.step(
                    "some must be an object",
                    () =>
                        assert(
                            data.some(([_, item1]) =>
                                item1.some(([_, item2]) => typeof item2 === "object" && item2 !== null)
                            ),
                        ),
                );
            });
        },
        ignore: !isMatchToScheme,
    });
});
