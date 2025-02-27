import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { fromFileUrl } from "jsr:@std/path@^1.0.8/from-file-url";
import { assert } from "jsr:@std/assert@^1.0.10";
import { HttpTransport, PublicClient } from "../../../mod.ts";
import { assertJsonSchema } from "../../utils.ts";

// —————————— Constants ——————————

const USER_ADDRESS = "0xedc88158266c50628a9ffbaa1db2635376577eea";

// —————————— Type schema ——————————

export type MethodReturnType = ReturnType<PublicClient["delegatorRewards"]>;
const MethodReturnType = tsj
    .createGenerator({ path: fromFileUrl(import.meta.url), skipTypeCheck: true })
    .createSchema("MethodReturnType");

// —————————— Test ——————————

Deno.test("delegatorRewards", async (t) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // —————————— Prepare ——————————

    const transport = new HttpTransport({ isTestnet: true });
    const client = new PublicClient({ transport });

    // —————————— Test ——————————

    const data = await client.delegatorRewards({ user: USER_ADDRESS });

    const isMatchToScheme = await t.step("Matching data to type schema", () => {
        assertJsonSchema(MethodReturnType, data);
    });

    await t.step({
        name: "Additional checks",
        fn: async (t) => {
            await t.step("Check key 'source'", async (t) => {
                await t.step("some should be 'delegation'", () => {
                    assert(data.some((x) => x.source === "delegation"));
                });
                await t.step("some should be 'commission'", () => {
                    assert(data.some((x) => x.source === "commission"));
                });
            });
        },
        ignore: !isMatchToScheme,
    });
});
