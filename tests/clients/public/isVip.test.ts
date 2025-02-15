import { assert } from "jsr:@std/assert@^1.0.10";
import { HttpTransport, PublicClient } from "../../../mod.ts";

// —————————— Constants ——————————

const USER_ADDRESS = "0x563C175E6f11582f65D6d9E360A618699DEe14a9";

// —————————— Test ——————————

Deno.test("isVip", async (t) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // —————————— Prepare ——————————

    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const client = new PublicClient({ transport });

    // —————————— Test ——————————

    await t.step("Matching data to type schema", async () => {
        const data = await client.isVip({ user: USER_ADDRESS });
        assert(data === true || data === false, "Data should be a boolean");
    });
});
