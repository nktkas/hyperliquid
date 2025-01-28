import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { fromFileUrl } from "jsr:@std/path@^1.0.8/from-file-url";
import { assert } from "jsr:@std/assert@^1.0.10";
import { HttpTransport, PublicClient } from "../../../mod.ts";
import { assertJsonSchema } from "../../utils.ts";

// —————————— Constants ——————————

const TX_HASH_WITH_ERROR = "0x8f1b2b67eda04ecbc7b00411ee669b010c0041e8f52c9ff5c3609d9ef7e66c71";
const TX_HASH_WITHOUT_ERROR = "0x4de9f1f5d912c23d8fbb0411f01bfe0000eb9f3ccb3fec747cb96e75e8944b06";

// —————————— Type schema ——————————

export type MethodReturnType = ReturnType<PublicClient["txDetails"]>;
const MethodReturnType = tsj
    .createGenerator({ path: fromFileUrl(import.meta.url), skipTypeCheck: true })
    .createSchema("MethodReturnType");

// —————————— Test ——————————

Deno.test("txDetails", async (t) => {
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // —————————— Prepare ——————————

    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const client = new PublicClient({ transport });

    // —————————— Test ——————————

    const isMatchToScheme = await t.step("Matching data to type schema", async () => {
        const data = await client.txDetails({ hash: TX_HASH_WITHOUT_ERROR });
        assertJsonSchema(MethodReturnType, data);
    });

    await t.step({
        name: "Additional checks",
        fn: async (t) => {
            await t.step("Check key 'tx.error'", async (t) => {
                await t.step("should be a 'string'", async () => {
                    const data = await client.txDetails({ hash: TX_HASH_WITH_ERROR });
                    assertJsonSchema(MethodReturnType, data);
                    assert(typeof data.tx.error === "string");
                });
                await t.step("should be 'null'", async () => {
                    const data = await client.txDetails({ hash: TX_HASH_WITHOUT_ERROR });
                    assertJsonSchema(MethodReturnType, data);
                    assert(data.tx.error === null);
                });
            });
        },
        ignore: !isMatchToScheme,
    });
});
