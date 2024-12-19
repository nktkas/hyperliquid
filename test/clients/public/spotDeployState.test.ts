import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.2";
import { HttpTransport, PublicClient } from "../../../index.ts";
import { assertIncludesNotEmptyArray, assertJsonSchema } from "../../utils.ts";

const USER_ADDRESS = "0x051dbfc562d44e4a01ebb986da35a47ab4f346db";

Deno.test("spotDeployState", async () => {
    // Create TypeScript type schemas
    const tsjSchemaGenerator = tsj.createGenerator({ path: resolve("./index.ts"), skipTypeCheck: true });
    const schema = tsjSchemaGenerator.createSchema("SpotDeployState");

    // Create client
    const client = new PublicClient(new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" }));

    //Test
    const data = await client.spotDeployState({ user: USER_ADDRESS });
    assertJsonSchema(schema, data);
    assertIncludesNotEmptyArray(data);
});
