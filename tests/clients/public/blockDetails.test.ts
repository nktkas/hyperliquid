import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { assert } from "jsr:@std/assert@^1.0.10";
import { HttpTransport, PublicClient } from "../../../index.ts";
import { assertJsonSchema } from "../../utils.ts";

const BLOCK_HEIGHT = 300836507;

Deno.test("blockDetails", async (t) => {
    // Create a scheme of type
    const typeSchema = tsj
        .createGenerator({ path: "./index.ts", skipTypeCheck: true })
        .createSchema("BlockDetailsResponse");

    // Create client
    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const client = new PublicClient({ transport });

    //Test
    const data = await client.blockDetails({ height: BLOCK_HEIGHT });

    const isMatchToScheme = await t.step("Matching data to type schema", () => {
        assertJsonSchema(typeSchema, data);
    });

    await t.step({
        name: "Additional checks",
        fn: async (t) => {
            await t.step("Check key 'blockDetails.txs[].error'", async (t) => {
                assert(data.blockDetails.txs.length > 0, "'blockDetails.txs' must be a non-empty array");

                await t.step("some must be null", () => {
                    assert(data.blockDetails.txs.some((tx) => tx.error === null));
                });
                await t.step("some must be a string", () => {
                    assert(data.blockDetails.txs.some((tx) => typeof tx.error === "string"));
                });
            });
        },
        ignore: !isMatchToScheme,
    });
});
