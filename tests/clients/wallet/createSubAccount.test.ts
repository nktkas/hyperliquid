import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import { assertJsonSchema, isHex } from "../../utils.ts";
import { HttpTransport, WalletClient } from "../../../index.ts";

const TEST_PRIVATE_KEY = Deno.args[0] as string | undefined;

if (!isHex(TEST_PRIVATE_KEY)) {
    throw new Error(`Expected a hex string, but got ${typeof TEST_PRIVATE_KEY}`);
}

// The test is ignored because: Only 10 sub-accounts can be created. And for a temporary wallet you need to somehow trade $100000 in volume
Deno.test({
    name: "createSubAccount",
    ignore: true,
    fn: async () => {
        // Create a scheme of type
        const typeSchema = tsj
            .createGenerator({ path: "./index.ts", skipTypeCheck: true })
            .createSchema("CreateSubAccountResponse");

        // Create client
        const account = privateKeyToAccount(TEST_PRIVATE_KEY);
        const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
        const walletClient = new WalletClient({ wallet: account, transport, isTestnet: true });

        // Test
        const result = await walletClient.createSubAccount({ name: String(Date.now()) });
        assertJsonSchema(typeSchema, result);
    },
});
