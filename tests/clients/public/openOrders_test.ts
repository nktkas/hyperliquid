import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { fromFileUrl } from "jsr:@std/path@^1.0.8/from-file-url";
import { assert } from "jsr:@std/assert@^1.0.10";
import { HttpTransport, PublicClient } from "../../../mod.ts";
import { assertJsonSchema } from "../../utils.ts";

// —————————— Constants ——————————

const USER_ADDRESS = "0x563C175E6f11582f65D6d9E360A618699DEe14a9";

// —————————— Type schema ——————————

export type MethodReturnType = ReturnType<PublicClient["openOrders"]>;
const MethodReturnType = tsj
    .createGenerator({ path: fromFileUrl(import.meta.url), skipTypeCheck: true })
    .createSchema("MethodReturnType");

// —————————— Test ——————————

Deno.test("openOrders", async (t) => {
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // —————————— Prepare ——————————

    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const client = new PublicClient({ transport });

    // —————————— Test ——————————

    const data = await client.openOrders({ user: USER_ADDRESS });

    const isMatchToScheme = await t.step("Matching data to type schema", () => {
        assertJsonSchema(MethodReturnType, data);
    });

    await t.step({
        name: "Additional checks",
        fn: async (t) => {
            await t.step("Check key 'side'", async (t) => {
                await t.step("some should be 'B'", () => {
                    assert(data.some((item) => item.side === "B"));
                });
                await t.step("some should be 'A'", () => {
                    assert(data.some((item) => item.side === "A"));
                });
            });

            await t.step("Check key 'cloid'", async (t) => {
                await t.step("some should be a 'string'", () => {
                    assert(data.some((item) => typeof item.cloid === "string"));
                });
                await t.step("some should be 'undefined'", () => {
                    assert(data.some((item) => item.cloid === undefined));
                });
            });

            await t.step("Check key 'reduceOnly'", async (t) => {
                await t.step("some should be 'true'", () => {
                    assert(data.some((item) => item.reduceOnly === true));
                });
                await t.step("some should be 'undefined'", () => {
                    assert(data.some((item) => item.reduceOnly === undefined));
                });
            });
        },
        ignore: !isMatchToScheme,
    });
});
