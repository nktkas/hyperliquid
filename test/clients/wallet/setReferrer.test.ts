import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.2";
import { generatePrivateKey, privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import { assertJsonSchema, isHex } from "../../utils.ts";
import { HttpTransport, WalletClient } from "../../../index.ts";

const TEST_PRIVATE_KEY = Deno.args[0];
if (!isHex(TEST_PRIVATE_KEY)) {
    throw new Error(`Expected a hex string, but got ${typeof TEST_PRIVATE_KEY}`);
}

Deno.test("setReferrer", async () => {
    // Create TypeScript type schemas
    const tsjSchemaGenerator = tsj.createGenerator({ path: resolve("./index.ts"), skipTypeCheck: true });
    const schema = tsjSchemaGenerator.createSchema("SuccessResponse");

    // Create client
    const account = privateKeyToAccount(TEST_PRIVATE_KEY);
    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const walletClient = new WalletClient(account, transport, true);

    // Preparing a temporary wallet
    const tempPrivKey = generatePrivateKey();
    const tempAccount = privateKeyToAccount(tempPrivKey);
    const tempWalletClient = new WalletClient(tempAccount, transport, true);

    await walletClient.usdSend({
        destination: tempAccount.address,
        amount: "2",
    });

    // Test
    const result = await tempWalletClient.setReferrer({ code: "TEST" });
    assertJsonSchema(schema, result);
});
