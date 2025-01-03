import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { assert } from "jsr:@std/assert@^1.0.10";
import { HttpTransport, PublicClient } from "../../../index.ts";
import { assertJsonSchema } from "../../utils.ts";

Deno.test("allMids", async (t) => {
    // Create a scheme of type
    const typeSchema = tsj
        .createGenerator({ path: "./index.ts", skipTypeCheck: true })
        .createSchema("AllMids");

    // Create client
    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const client = new PublicClient({ transport });

    //Test
    await t.step("Matching data to type schema", async () => {
        const data = await client.allMids();
        assertJsonSchema(typeSchema, data);
        assert(Object.keys(data).length > 0, "Expected data to have at least one element");
    });
});
