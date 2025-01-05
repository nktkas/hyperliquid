import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import { BigNumber } from "npm:bignumber.js@^9.1.2";
import { assertJsonSchema, getAssetData, isHex } from "../../utils.ts";
import { HttpTransport, PublicClient, WalletClient } from "../../../index.ts";

const TEST_PRIVATE_KEY = Deno.args[0] as string | undefined;
const TEST_PERPS_ASSET = Deno.args[1] as string | undefined;

if (!isHex(TEST_PRIVATE_KEY)) {
    throw new Error(`Expected a hex string, but got ${typeof TEST_PRIVATE_KEY}`);
}
if (typeof TEST_PERPS_ASSET !== "string") {
    throw new Error(`Expected a string, but got ${typeof TEST_PERPS_ASSET}`);
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
    const { id, universe, ctx } = await getAssetData(publicClient, TEST_PERPS_ASSET);

    // Calculations
    const pxUp = new BigNumber(ctx.markPx)
        .times(1.01)
        .decimalPlaces(universe.szDecimals, BigNumber.ROUND_DOWN)
        .toString();
    const pxDown = new BigNumber(ctx.markPx)
        .times(0.99)
        .decimalPlaces(universe.szDecimals, BigNumber.ROUND_DOWN)
        .toString();
    const sz = new BigNumber(15) // USD
        .div(ctx.markPx)
        .decimalPlaces(universe.szDecimals, BigNumber.ROUND_DOWN)
        .toString();

    // Switch to isolated shoulder
    await walletClient.updateLeverage({
        asset: id,
        isCross: false,
        leverage: 3,
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
