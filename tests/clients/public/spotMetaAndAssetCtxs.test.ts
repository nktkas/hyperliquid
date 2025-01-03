import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { assert } from "jsr:@std/assert@^1.0.10";
import { HttpTransport, PublicClient } from "../../../index.ts";
import { assertJsonSchema } from "../../utils.ts";

Deno.test("spotMetaAndAssetCtxs", async (t) => {
    // Create a scheme of type
    const typeSchema = tsj
        .createGenerator({ path: "./index.ts", skipTypeCheck: true })
        .createSchema("SpotMetaAndAssetCtxs");

    // Create client
    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const client = new PublicClient({ transport });

    //Test
    const data = await client.spotMetaAndAssetCtxs();

    const isMatchToScheme = await t.step("Matching data to type schema", () => {
        assertJsonSchema(typeSchema, data);
    });

    await t.step({
        name: "Additional checks",
        fn: async (t) => {
            await t.step("Check key [0]", async (t) => {
                await t.step("Check key 'universe'", async (t) => {
                    assert(data[0].universe.length > 0, "'universe' must be a non-empty array");

                    await t.step("Check key 'tokens'", () => {
                        assert(
                            data[0].universe.some((x) => x.tokens.length > 0),
                            "some 'tokens' must be a non-empty array",
                        );
                    });
                });

                await t.step("Check key 'tokens'", async (t) => {
                    assert(data[0].tokens.length > 0, "'tokens' must be a non-empty array");

                    await t.step("Check key 'evmContract'", async (t) => {
                        await t.step(
                            "some must be null",
                            () => assert(data[0].tokens.some((item) => item.evmContract === null)),
                        );
                        await t.step(
                            "some must be an object",
                            () =>
                                assert(
                                    data[0].tokens.some((item) =>
                                        typeof item.evmContract === "object" && item.evmContract !== null
                                    ),
                                ),
                        );
                    });

                    await t.step("Check key 'fullName'", async (t) => {
                        await t.step(
                            "some must be null",
                            () => assert(data[0].tokens.some((item) => item.fullName === null)),
                        );
                        await t.step(
                            "some must be a string",
                            () => assert(data[0].tokens.some((item) => typeof item.fullName === "string")),
                        );
                    });
                });
            });

            await t.step("Check key [1]", async (t) => {
                assert(data[1].length > 0, "'[1]' must be a non-empty array");

                await t.step("Check key 'midPx'", async (t) => {
                    await t.step(
                        "some must be a string",
                        () => assert(data[1].some((item) => typeof item.midPx === "string")),
                    );
                    await t.step(
                        "some must be null",
                        () => assert(data[1].some((item) => item.midPx === null)),
                    );
                });
            });
        },
        ignore: !isMatchToScheme,
    });
});
