import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { assert } from "jsr:@std/assert@^1.0.10";
import { HttpTransport, PublicClient } from "../../../mod.ts";
import { assertJsonSchema } from "../../utils.ts";

// —————————— Constants ——————————

const BLOCK_HEIGHT = 300836507;

// —————————— Type schema ——————————

export type MethodReturnType = ReturnType<PublicClient["blockDetails"]>;
const MethodReturnType = tsj
    .createGenerator({ path: import.meta.url, skipTypeCheck: true })
    .createSchema("MethodReturnType");

// —————————— Test ——————————

Deno.test("blockDetails", async (t) => {
    // —————————— Prepare ——————————

    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const client = new PublicClient({ transport });

    // —————————— Test ——————————

    const data = await client.blockDetails({ height: BLOCK_HEIGHT });

    const isMatchToScheme = await t.step("Matching data to type schema", () => {
        assertJsonSchema(MethodReturnType, data);
    });

    await t.step({
        name: "Additional checks",
        fn: async (t) => {
            await t.step("Check key 'blockDetails.txs[].error'", async (t) => {
                await t.step("some should be 'string'", () => {
                    assert(data.blockDetails.txs.some((tx) => typeof tx.error === "string"));
                });
                await t.step("some should be 'null'", () => {
                    assert(data.blockDetails.txs.some((tx) => tx.error === null));
                });
            });
        },
        ignore: !isMatchToScheme,
    });
});
