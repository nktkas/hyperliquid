import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import { BigNumber } from "npm:bignumber.js@^9.1.2";
import { assertIncludesNotEmptyArray, assertJsonSchema, getAssetData, getPxDecimals, isHex } from "../../utils.ts";
import { HttpTransport, PublicClient, WalletClient } from "../../../index.ts";

const TEST_PRIVATE_KEY = Deno.args[0] as string | undefined;
const TEST_PERPS_ASSET = Deno.args[1] as string | undefined;

if (!isHex(TEST_PRIVATE_KEY)) {
    throw new Error(`Expected a hex string, but got ${typeof TEST_PRIVATE_KEY}`);
}
if (typeof TEST_PERPS_ASSET !== "string") {
    throw new Error(`Expected a string, but got ${typeof TEST_PERPS_ASSET}`);
}

Deno.test("cancel", async () => {
    // Create a scheme of type
    const typeSchema = tsj
        .createGenerator({ path: "./index.ts", skipTypeCheck: true })
        .createSchema("CancelResponseSuccess");

    // Create client
    const account = privateKeyToAccount(TEST_PRIVATE_KEY);
    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const walletClient = new WalletClient({ wallet: account, transport, isTestnet: true });
    const publicClient = new PublicClient({ transport });

    // Preparation

    // Get asset data
    const { id, universe, ctx } = await getAssetData(publicClient, TEST_PERPS_ASSET);

    // Calculations
    const pxDecimals = getPxDecimals("perp", universe.szDecimals);
    const pxDown = new BigNumber(ctx.markPx)
        .times(0.99)
        .dp(pxDecimals, BigNumber.ROUND_DOWN)
        .toString();
    const sz = new BigNumber(11) // USD
        .div(ctx.markPx)
        .dp(universe.szDecimals, BigNumber.ROUND_DOWN)
        .toString();

    // Change leverage
    await walletClient.updateLeverage({
        asset: id,
        isCross: true,
        leverage: 10,
    });

    // Preparation of orders
    const openOrderRes = await walletClient.order({
        orders: [
            {
                a: id,
                b: true,
                p: pxDown,
                s: sz,
                r: false,
                t: { limit: { tif: "Gtc" } },
            },
        ],
        grouping: "na",
    });
    const [order] = openOrderRes.response.data.statuses;

    // Test
    const result = await walletClient.cancel({
        cancels: [{
            a: id,
            o: "resting" in order ? order.resting.oid : order.filled.oid,
        }],
    });

    assertJsonSchema(typeSchema, result);
    assertIncludesNotEmptyArray(result);
});
