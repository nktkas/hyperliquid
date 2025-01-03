import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import { assertJsonSchema, isHex } from "../../utils.ts";
import { HttpTransport, WalletClient } from "../../../index.ts";

const TEST_PRIVATE_KEY = Deno.args[0];
if (!isHex(TEST_PRIVATE_KEY)) {
    throw new Error(`Expected a hex string, but got ${typeof TEST_PRIVATE_KEY}`);
}

Deno.test("usdClassTransfer", async (t) => {
    // Create a scheme of type
    const typeSchema = tsj
        .createGenerator({ path: "./index.ts", skipTypeCheck: true })
        .createSchema("SuccessResponse");

    // Create client
    const account = privateKeyToAccount(TEST_PRIVATE_KEY);
    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const walletClient = new WalletClient({ wallet: account, transport, isTestnet: true });

    // Test
    await t.step("transfer from perp to spot", async () => {
        const result = await walletClient.usdClassTransfer({
            amount: "1",
            toPerp: false,
        });
        assertJsonSchema(typeSchema, result);
    });

    await t.step("transfer from spot to perp", async () => {
        const result = await walletClient.usdClassTransfer({
            amount: "1",
            toPerp: true,
        });
        assertJsonSchema(typeSchema, result);
    });
});
