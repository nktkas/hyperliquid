import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { assertGreater } from "jsr:@std/assert@^1.0.10";
import { HttpTransport, PublicClient } from "../../../index.ts";
import { assertJsonSchema } from "../../utils.ts";

const USER_ADDRESS = "0x563C175E6f11582f65D6d9E360A618699DEe14a9";

Deno.test("extraAgents", async (t) => {
    // Create a scheme of type
    const typeSchema = tsj
        .createGenerator({ path: "./index.ts", skipTypeCheck: true })
        .createSchema("ExtraAgent");

    // Create client
    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const client = new PublicClient({ transport });

    //Test
    await t.step("Matching data to type schema", async () => {
        const data = await client.extraAgents({ user: USER_ADDRESS });
        assertGreater(data.length, 0, "Expected data to have at least one element");
        data.forEach((item) => assertJsonSchema(typeSchema, item));
    });
});
