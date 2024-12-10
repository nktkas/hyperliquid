import { assert } from "jsr:@std/assert@^1.0.9";
import { HttpTransport, PublicClient } from "../../../index.ts";

const BUILDER_ADDRESS = "0xe019d6167E7e324aEd003d94098496b6d986aB05";

Deno.test("maxBuilderFee", async () => {
    // Create client
    const client = new PublicClient(new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" }));

    //Test
    const data = await client.maxBuilderFee({ user: BUILDER_ADDRESS, builder: BUILDER_ADDRESS });
    assert(typeof data === "number", `Returned data is not a number, got ${typeof data}`);
});
