import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { fromFileUrl } from "jsr:@std/path@^1.0.8/from-file-url";
import { assert } from "jsr:@std/assert@^1.0.10";
import { HttpTransport, PublicClient } from "../../../mod.ts";
import { assertJsonSchema } from "../../utils.ts";

// —————————— Type schema ——————————

export type MethodReturnType = ReturnType<PublicClient["spotMeta"]>;
const MethodReturnType = tsj
    .createGenerator({ path: fromFileUrl(import.meta.url), skipTypeCheck: true })
    .createSchema("MethodReturnType");

// —————————— Test ——————————

Deno.test("spotMeta", async (t) => {
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // —————————— Prepare ——————————

    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const client = new PublicClient({ transport });

    // —————————— Test ——————————

    const data = await client.spotMeta();

    const isMatchToScheme = await t.step("Matching data to type schema", () => {
        assertJsonSchema(MethodReturnType, data);
    });

    await t.step({
        name: "Additional checks",
        fn: async (t) => {
            await t.step("Check key 'tokens'", async (t) => {
                await t.step("Check key 'evmContract'", async (t) => {
                    await t.step("some should be 'null'", () => {
                        assert(data.tokens.some((item) => item.evmContract === null));
                    });
                    await t.step("some should be an 'object'", () => {
                        assert(
                            data.tokens.some((item) =>
                                typeof item.evmContract === "object" && item.evmContract !== null
                            ),
                        );
                    });
                });

                await t.step("Check key 'fullName'", async (t) => {
                    await t.step("some should be 'null'", () => {
                        assert(data.tokens.some((item) => item.fullName === null));
                    });
                    await t.step("some should be a 'string'", () => {
                        assert(data.tokens.some((item) => typeof item.fullName === "string"));
                    });
                });
            });
        },
        ignore: !isMatchToScheme,
    });
});
