import { assert } from "jsr:@std/assert@^1.0.10";
import { HttpTransport, PublicClient } from "../../../index.ts";

const BUILDER_ADDRESS = "0xe019d6167E7e324aEd003d94098496b6d986aB05";

Deno.test("maxBuilderFee", async (t) => {
    // Create client
    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const client = new PublicClient({ transport });

    //Test
    await t.step("Matching data to type schema", async () => {
        const data = await client.maxBuilderFee({ user: BUILDER_ADDRESS, builder: BUILDER_ADDRESS });
        assert(typeof data === "number", "Expected number, got: " + typeof data);
    });
});
