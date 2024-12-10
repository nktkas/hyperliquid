import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.2";
import { HttpTransport, PublicClient } from "../../../index.ts";
import { assertJsonSchema } from "../../utils.ts";

const TX_HASH = "0x4de9f1f5d912c23d8fbb0411f01bfe0000eb9f3ccb3fec747cb96e75e8944b06";

Deno.test("txDetails", async () => {
    // Create TypeScript type schemas
    const tsjSchemaGenerator = tsj.createGenerator({ path: resolve("./index.ts"), skipTypeCheck: true });
    const schema = tsjSchemaGenerator.createSchema("TxDetailsResponse");

    // Create client
    const client = new PublicClient(new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" }));

    //Test
    const data = await client.txDetails({ hash: TX_HASH });
    assertJsonSchema(schema, data);
});
