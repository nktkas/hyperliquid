import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.2";
import { HttpTransport, PublicClient } from "../../../index.ts";
import { assertIncludesNotEmptyArray, assertJsonSchema } from "../../utils.ts";

Deno.test("meta", async () => {
    // Create TypeScript type schemas
    const tsjSchemaGenerator = tsj.createGenerator({ path: resolve("./index.ts"), skipTypeCheck: true });
    const schema = tsjSchemaGenerator.createSchema("Meta");

    // Create client
    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const client = new PublicClient({ transport });

    //Test
    const data = await client.meta();
    assertJsonSchema(schema, data);
    assertIncludesNotEmptyArray(data);
});
