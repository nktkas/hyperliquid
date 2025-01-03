import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { assert } from "jsr:@std/assert@^1.0.10";
import { HttpTransport, PublicClient } from "../../../index.ts";
import { assertJsonSchema } from "../../utils.ts";

Deno.test("spotMeta", async (t) => {
    // Create a scheme of type
    const typeSchema = tsj
        .createGenerator({ path: "./index.ts", skipTypeCheck: true })
        .createSchema("SpotMeta");

    // Create client
    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const client = new PublicClient({ transport });

    //Test
    const data = await client.spotMeta();

    const isMatchToScheme = await t.step("Matching data to type schema", () => {
        assertJsonSchema(typeSchema, data);
    });

    await t.step({
        name: "Additional checks",
        fn: async (t) => {
            await t.step("Check key 'universe'", async (t) => {
                assert(data.universe.length > 0, "'universe' must be a non-empty array");

                await t.step("Check key 'tokens'", () => {
                    assert(data.universe.some((x) => x.tokens.length > 0), "some 'tokens' must be a non-empty array");
                });
            });

            await t.step("Check key 'tokens'", async (t) => {
                assert(data.tokens.length > 0, "'tokens' must be a non-empty array");

                await t.step("Check key 'evmContract'", async (t) => {
                    await t.step(
                        "some must be null",
                        () => assert(data.tokens.some((item) => item.evmContract === null)),
                    );
                    await t.step(
                        "some must be an object",
                        () =>
                            assert(
                                data.tokens.some((item) =>
                                    typeof item.evmContract === "object" && item.evmContract !== null
                                ),
                            ),
                    );
                });

                await t.step("Check key 'fullName'", async (t) => {
                    await t.step(
                        "some must be null",
                        () => assert(data.tokens.some((item) => item.fullName === null)),
                    );
                    await t.step(
                        "some must be a string",
                        () => assert(data.tokens.some((item) => typeof item.fullName === "string")),
                    );
                });
            });
        },
        ignore: !isMatchToScheme,
    });
});
