import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { fromFileUrl } from "jsr:@std/path@^1.0.8/from-file-url";
import { assert } from "jsr:@std/assert@^1.0.10";
import { HttpTransport, PublicClient } from "../../../mod.ts";
import { assertJsonSchema } from "../../utils.ts";

// —————————— Type schema ——————————

export type MethodReturnType = ReturnType<PublicClient["metaAndAssetCtxs"]>;
const MethodReturnType = tsj
    .createGenerator({ path: fromFileUrl(import.meta.url), skipTypeCheck: true })
    .createSchema("MethodReturnType");

// —————————— Test ——————————

Deno.test("metaAndAssetCtxs", async (t) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // —————————— Prepare ——————————

    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const client = new PublicClient({ transport });

    // —————————— Test ——————————

    const data = await client.metaAndAssetCtxs();

    const isMatchToScheme = await t.step("Matching data to type schema", () => {
        assertJsonSchema(MethodReturnType, data);
    });

    await t.step({
        name: "Additional checks",
        fn: async (t) => {
            await t.step("Check key [0]", async (t) => {
                await t.step("Check key 'universe[].onlyIsolated'", async (t) => {
                    await t.step("some should be 'true'", () => {
                        assert(data[0].universe.some((item) => item.onlyIsolated === true));
                    });
                    await t.step("some should be 'undefined'", () => {
                        assert(data[0].universe.some((item) => item.onlyIsolated === undefined));
                    });
                });
            });

            await t.step("Check key [1]", async (t) => {
                await t.step("Check key 'midPx'", async (t) => {
                    await t.step("some should be a 'string'", () => {
                        assert(data[1].some((item) => typeof item.midPx === "string"));
                    });
                    await t.step("some should be 'null'", () => {
                        assert(data[1].some((item) => item.midPx === null));
                    });
                });

                await t.step("Check key 'premium'", async (t) => {
                    await t.step("some should be a 'string'", () => {
                        assert(data[1].some((item) => typeof item.premium === "string"));
                    });
                    await t.step("some should be 'null'", () => {
                        assert(data[1].some((item) => item.premium === null));
                    });
                });

                await t.step("Check key 'impactPxs'", async (t) => {
                    await t.step("some should be a 'string[]'", () => {
                        assert(data[1].some((item) =>
                            Array.isArray(item.impactPxs) &&
                            item.impactPxs.every((item) => typeof item === "string")
                        ));
                    });
                    await t.step("some should be 'null'", () => {
                        assert(data[1].some((item) => item.impactPxs === null));
                    });
                });
            });
        },
        ignore: !isMatchToScheme,
    });
});
