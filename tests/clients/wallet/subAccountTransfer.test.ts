import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import { assertJsonSchema, isHex } from "../../utils.ts";
import { HttpTransport, WalletClient } from "../../../index.ts";

const TEST_PRIVATE_KEY = Deno.args[0] as string | undefined;
const TEST_SUB_ACCOUNT_ADDRESS = Deno.args[2] as string | undefined;

if (!isHex(TEST_PRIVATE_KEY)) {
    throw new Error(`Expected a hex string, but got ${typeof TEST_PRIVATE_KEY}`);
}
if (!isHex(TEST_SUB_ACCOUNT_ADDRESS)) {
    throw new Error(`Expected a hex string, but got ${typeof TEST_SUB_ACCOUNT_ADDRESS}`);
}

Deno.test("subAccountTransfer", async (t) => {
    // Create a scheme of type
    const typeSchema = tsj
        .createGenerator({ path: "./index.ts", skipTypeCheck: true })
        .createSchema("SuccessResponse");

    // Create client
    const account = privateKeyToAccount(TEST_PRIVATE_KEY);
    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const walletClient = new WalletClient({ wallet: account, transport, isTestnet: true });

    // Test
    await t.step("deposit to sub account", async () => {
        const result = await walletClient.subAccountTransfer({
            subAccountUser: TEST_SUB_ACCOUNT_ADDRESS,
            isDeposit: true,
            usd: 1,
        });
        assertJsonSchema(typeSchema, result);
    });
    await t.step("withdraw from sub account", async () => {
        const result = await walletClient.subAccountTransfer({
            subAccountUser: TEST_SUB_ACCOUNT_ADDRESS,
            isDeposit: false,
            usd: 1,
        });
        assertJsonSchema(typeSchema, result);
    });
});
