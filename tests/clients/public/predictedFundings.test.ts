import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { fromFileUrl } from "jsr:@std/path@^1.0.8/from-file-url";
import { assert } from "jsr:@std/assert@^1.0.10";
import { HttpTransport, PublicClient } from "../../../mod.ts";
import { assertJsonSchema } from "../../utils.ts";

// —————————— Type schema ——————————

export type MethodReturnType = ReturnType<PublicClient["predictedFundings"]>;
const MethodReturnType = tsj
    .createGenerator({ path: fromFileUrl(import.meta.url), skipTypeCheck: true })
    .createSchema("MethodReturnType");

// —————————— Test ——————————

Deno.test("predictedFundings", async (t) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // —————————— Prepare ——————————

    const transport = new HttpTransport({ isTestnet: true });
    const client = new PublicClient({ transport });

    // —————————— Test ——————————

    const data = await client.predictedFundings();

    const isMatchToScheme = await t.step("Matching data to type schema", () => {
        assertJsonSchema(MethodReturnType, data);
    });

    await t.step({
        name: "Additional checks",
        fn: async (t) => {
            await t.step("Check key [][1][][1]", async (t) => {
                await t.step("some should be 'null'", () => {
                    assert(data.some(([_, item1]) => item1.some(([_, item2]) => item2 === null)));
                });
                await t.step("some should be an 'object'", () => {
                    assert(
                        data.some(([_, item1]) =>
                            item1.some(([_, item2]) => typeof item2 === "object" && item2 !== null)
                        ),
                    );
                });
            });
        },
        ignore: !isMatchToScheme,
    });
});
