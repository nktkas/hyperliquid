import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.2";
import { HttpTransport, PublicClient } from "../../../index.ts";
import { assertIncludesNotEmptyArray, assertJsonSchema } from "../../utils.ts";

const USER_ADDRESS = "0xe973105a27e17350500926ae664dfcfe6006d924";

Deno.test("userFees", async () => {
    // Create TypeScript type schemas
    const tsjSchemaGenerator = tsj.createGenerator({ path: resolve("./index.ts"), skipTypeCheck: true });
    const schema = tsjSchemaGenerator.createSchema("UserFees");

    // Create client
    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const client = new PublicClient({ transport });

    //Test
    const data = await client.userFees({ user: USER_ADDRESS });
    assertJsonSchema(schema, data);
    assertIncludesNotEmptyArray(data);
});
