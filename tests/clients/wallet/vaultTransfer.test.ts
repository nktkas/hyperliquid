import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import { assertJsonSchema, isHex } from "../../utils.ts";
import { HttpTransport, WalletClient } from "../../../index.ts";

const TEST_PRIVATE_KEY = Deno.args[0];
const TEST_VAULT_ADDRESS = "0x1719884eb866cb12b2287399b15f7db5e7d775ea";
if (!isHex(TEST_PRIVATE_KEY)) {
    throw new Error(`Expected a hex string, but got ${typeof TEST_PRIVATE_KEY}`);
}

Deno.test("vaultTransfer", async (t) => {
    // Create a scheme of type
    const typeSchema = tsj
        .createGenerator({ path: "./index.ts", skipTypeCheck: true })
        .createSchema("SuccessResponse");

    // Create client
    const account = privateKeyToAccount(TEST_PRIVATE_KEY);
    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const walletClient = new WalletClient({ wallet: account, transport, isTestnet: true });

    // Test
    await t.step("withdraw from vault", async () => {
        const result = await walletClient.vaultTransfer({
            vaultAddress: TEST_VAULT_ADDRESS,
            isDeposit: false,
            usd: 5000000, // 5 USD minimum
        });

        assertJsonSchema(typeSchema, result);
    });

    await t.step("deposit to vault", async () => {
        const result = await walletClient.vaultTransfer({
            vaultAddress: TEST_VAULT_ADDRESS,
            isDeposit: true,
            usd: 5000000, // 5 USD minimum
        });
        assertJsonSchema(typeSchema, result);
    });
});
