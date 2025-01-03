import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import { assertJsonSchema, getAssetData, isHex } from "../../utils.ts";
import { HttpTransport, PublicClient, WalletClient } from "../../../index.ts";

const TEST_PRIVATE_KEY = Deno.args[0];
const TEST_ASSET = "ETH";
if (!isHex(TEST_PRIVATE_KEY)) {
    throw new Error(`Expected a hex string, but got ${typeof TEST_PRIVATE_KEY}`);
}

Deno.test("updateLeverage", async (t) => {
    // Create a scheme of type
    const typeSchema = tsj
        .createGenerator({ path: "./index.ts", skipTypeCheck: true })
        .createSchema("SuccessResponse");

    // Create client
    const account = privateKeyToAccount(TEST_PRIVATE_KEY);
    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const walletClient = new WalletClient({ wallet: account, transport, isTestnet: true });
    const publicClient = new PublicClient({ transport });

    // Preparation

    // Get asset data
    const { id } = await getAssetData(publicClient, TEST_ASSET);

    // Test
    await t.step("change to cross leverage", async () => {
        const result = await walletClient.updateLeverage({
            asset: id,
            isCross: true,
            leverage: 1,
        });
        assertJsonSchema(typeSchema, result);
    });

    await t.step("change to isolated leverage", async () => {
        const result = await walletClient.updateLeverage({
            asset: id,
            isCross: false,
            leverage: 1,
        });
        assertJsonSchema(typeSchema, result);
    });
});
