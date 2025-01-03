import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { assert } from "jsr:@std/assert@^1.0.10";
import { HttpTransport, PublicClient } from "../../../index.ts";
import { assertJsonSchema } from "../../utils.ts";

const TX_HASH_WITH_ERROR = "0x8f1b2b67eda04ecbc7b00411ee669b010c0041e8f52c9ff5c3609d9ef7e66c71";
const TX_HASH_WITHOUT_ERROR = "0x4de9f1f5d912c23d8fbb0411f01bfe0000eb9f3ccb3fec747cb96e75e8944b06";

Deno.test("txDetails", async (t) => {
    // Create a scheme of type
    const typeSchema = tsj
        .createGenerator({ path: "./index.ts", skipTypeCheck: true })
        .createSchema("TxDetailsResponse");

    // Create client
    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const client = new PublicClient({ transport });

    //Test
    const isMatchToScheme = await t.step("Matching data to type schema", async () => {
        const data = await client.txDetails({ hash: TX_HASH_WITHOUT_ERROR });
        assertJsonSchema(typeSchema, data);
    });

    await t.step({
        name: "Additional checks",
        fn: async (t) => {
            await t.step("Check key 'tx.error'", async (t) => {
                await t.step("must be a string", async () => {
                    const data = await client.txDetails({ hash: TX_HASH_WITH_ERROR });
                    assertJsonSchema(typeSchema, data);
                    assert(typeof data.tx.error === "string");
                });
                await t.step("must be null", async () => {
                    const data = await client.txDetails({ hash: TX_HASH_WITHOUT_ERROR });
                    assertJsonSchema(typeSchema, data);
                    assert(data.tx.error === null);
                });
            });
        },
        ignore: !isMatchToScheme,
    });
});
