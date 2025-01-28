import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { fromFileUrl } from "jsr:@std/path@^1.0.8/from-file-url";
import { assert } from "jsr:@std/assert@^1.0.10";
import { HttpTransport, PublicClient } from "../../../mod.ts";
import { assertJsonSchema } from "../../utils.ts";

// —————————— Type schema ——————————

export type MethodReturnType = ReturnType<PublicClient["meta"]>;
const MethodReturnType = tsj
    .createGenerator({ path: fromFileUrl(import.meta.url), skipTypeCheck: true })
    .createSchema("MethodReturnType");

// —————————— Test ——————————

Deno.test("meta", async (t) => {
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // —————————— Prepare ——————————

    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const client = new PublicClient({ transport });

    // —————————— Test ——————————

    const data = await client.meta();

    const isMatchToScheme = await t.step("Matching data to type schema", () => {
        assertJsonSchema(MethodReturnType, data);
    });

    await t.step({
        name: "Additional checks",
        fn: async (t) => {
            await t.step("Check key 'universe.onlyIsolated'", async (t) => {
                await t.step("some should be 'true'", () => {
                    assert(data.universe.some((item) => item.onlyIsolated === true));
                });
                await t.step("some should be 'undefined'", () => {
                    assert(data.universe.some((item) => item.onlyIsolated === undefined));
                });
            });
        },
        ignore: !isMatchToScheme,
    });
});
