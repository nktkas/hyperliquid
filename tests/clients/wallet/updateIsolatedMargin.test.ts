import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import { BigNumber } from "npm:bignumber.js@^9.1.2";
import { assertJsonSchema, getAssetData, getPxDecimals, isHex } from "../../utils.ts";
import { HttpTransport, PublicClient, WalletClient } from "../../../index.ts";

const TEST_PRIVATE_KEY = Deno.args[0];
const TEST_ASSET = "ETH";
if (!isHex(TEST_PRIVATE_KEY)) {
    throw new Error(`Expected a hex string, but got ${typeof TEST_PRIVATE_KEY}`);
}

Deno.test("updateIsolatedMargin", async (t) => {
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
    const { id, universe, ctx } = await getAssetData(publicClient, TEST_ASSET);

    // Calculations
    const pxDecimals = getPxDecimals("perp", universe.szDecimals);
    const pxUp = new BigNumber(ctx.markPx)
        .times(1.01)
        .decimalPlaces(pxDecimals, BigNumber.ROUND_DOWN)
        .toString();
    const pxDown = new BigNumber(ctx.markPx)
        .times(0.99)
        .decimalPlaces(pxDecimals, BigNumber.ROUND_DOWN)
        .toString();
    const sz = new BigNumber(15) // USD
        .div(ctx.markPx)
        .decimalPlaces(universe.szDecimals, BigNumber.ROUND_DOWN)
        .toString();

    // Switch to isolated shoulder
    await walletClient.updateLeverage({
        asset: id,
        isCross: false,
        leverage: 10,
    });

    // Preparing position
    await walletClient.order({
        orders: [{
            a: id,
            b: true,
            p: pxUp,
            s: sz,
            r: false,
            t: { limit: { tif: "Gtc" } },
        }],
        grouping: "na",
    });

    // Test
    await t.step("for long position", async () => {
        const result = await walletClient.updateIsolatedMargin({
            asset: id,
            isBuy: true,
            ntli: 1,
        });
        assertJsonSchema(typeSchema, result);
    });

    await t.step("for short position", async () => {
        const result = await walletClient.updateIsolatedMargin({
            asset: id,
            isBuy: false,
            ntli: 1,
        });
        assertJsonSchema(typeSchema, result);
    });

    // Post test cleaning
    await walletClient.order({
        orders: [{
            a: id,
            b: false,
            p: pxDown,
            s: "0", // Full position size
            r: true,
            t: { limit: { tif: "Gtc" } },
        }],
        grouping: "na",
    });
});
