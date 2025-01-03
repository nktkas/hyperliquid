import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { assert } from "jsr:@std/assert@^1.0.10";
import { HttpTransport, PublicClient } from "../../../index.ts";
import { assertJsonSchema } from "../../utils.ts";

Deno.test("metaAndAssetCtxs", async (t) => {
    // Create a scheme of type
    const typeSchema = tsj
        .createGenerator({ path: "./index.ts", skipTypeCheck: true })
        .createSchema("MetaAndAssetCtxs");

    // Create client
    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const client = new PublicClient({ transport });

    //Test
    const data = await client.metaAndAssetCtxs();

    const isMatchToScheme = await t.step("Matching data to type schema", () => {
        assertJsonSchema(typeSchema, data);
        assert(data.length === 2, "response must have 2 elements, but got: " + data.length);
    });

    await t.step({
        name: "Additional checks",
        fn: async (t) => {
            await t.step("Check key [0]", async (t) => {
                assert(data[0].universe.length > 0, "'universe' must be a non-empty array");

                await t.step("Check key 'universe[].onlyIsolated'", async (t) => {
                    await t.step(
                        "some must be true",
                        () => assert(data[0].universe.some((item) => item.onlyIsolated === true)),
                    );
                    await t.step(
                        "some must be undefined",
                        () => assert(data[0].universe.some((item) => item.onlyIsolated === undefined)),
                    );
                });
            });

            await t.step("Check key [1]", async (t) => {
                assert(data[1].length > 0, "'[1]' must be a non-empty array");

                await t.step("Check key 'premium'", async (t) => {
                    await t.step(
                        "some must be a string",
                        () => assert(data[1].some((item) => typeof item.premium === "string")),
                    );
                    await t.step(
                        "some must be null",
                        () => assert(data[1].some((item) => item.premium === null)),
                    );
                });
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
                await t.step("Check key 'impactPxs'", async (t) => {
                    await t.step(
                        "some must be a string[]",
                        () =>
                            assert(data[1].some((item) =>
                                Array.isArray(item.impactPxs) &&
                                item.impactPxs.length > 0 &&
                                item.impactPxs.every((item) => typeof item === "string")
                            )),
                    );
                    await t.step(
                        "some must be null",
                        () => assert(data[1].some((item) => item.impactPxs === null)),
                    );
                });
            });
        },
        ignore: !isMatchToScheme,
    });
});
