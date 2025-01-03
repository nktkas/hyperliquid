import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { HttpTransport, PublicClient } from "../../../index.ts";
import { assertJsonSchema } from "../../utils.ts";

const USER_ADDRESS = "0x563C175E6f11582f65D6d9E360A618699DEe14a9";

Deno.test("userRateLimit", async (t) => {
    // Create a scheme of type
    const typeSchema = tsj
        .createGenerator({ path: "./index.ts", skipTypeCheck: true })
        .createSchema("UserRateLimit");

    // Create client
    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const client = new PublicClient({ transport });

    //Test
    await t.step("Matching data to type schema", async () => {
        const data = await client.userRateLimit({ user: USER_ADDRESS });
        assertJsonSchema(typeSchema, data);
    });
});
