import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.2";
import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import { BigNumber } from "npm:bignumber.js@^9.1.2";
import { assertIncludesNotEmptyArray, assertJsonSchema, getAssetData, getPxDecimals, isHex } from "../../../utils.ts";
import { HttpTransport, PublicClient, WalletClient } from "../../../../index.ts";

const TEST_PRIVATE_KEY = Deno.args[0];
const TEST_ASSET = "ETH";
if (!isHex(TEST_PRIVATE_KEY)) {
    throw new Error(`Expected a hex string, but got ${typeof TEST_PRIVATE_KEY}`);
}

Deno.test("modify", async () => {
    // Create TypeScript type schemas
    const tsjSchemaGenerator = tsj.createGenerator({ path: resolve("./index.ts"), skipTypeCheck: true });
    const schema = tsjSchemaGenerator.createSchema("SuccessResponse");

    // Create client
    const account = privateKeyToAccount(TEST_PRIVATE_KEY);
    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const walletClient = new WalletClient(account, transport, true);
    const publicClient = new PublicClient(transport);

    // Preparation

    // Get asset data
    const { id, universe, ctx } = await getAssetData(publicClient, TEST_ASSET);

    // Calculations
    const pxDecimals = getPxDecimals("perp", universe.szDecimals);
    const pxDown = new BigNumber(ctx.markPx)
        .times(0.99)
        .decimalPlaces(pxDecimals, BigNumber.ROUND_DOWN)
        .toString();
    const sz = new BigNumber(15) // USD
        .div(ctx.markPx)
        .decimalPlaces(universe.szDecimals, BigNumber.ROUND_DOWN)
        .toString();

    // Preparation of orders
    const openOrderRes = await walletClient.order({
        orders: [{
            a: id,
            b: true,
            p: pxDown,
            s: sz,
            r: false,
            t: { limit: { tif: "Gtc" } },
        }],
        grouping: "na",
    });
    const [order] = openOrderRes.response.data.statuses;

    // Test
    const result = await walletClient.modify({
        oid: "resting" in order ? order.resting.oid : order.filled.oid,
        order: {
            a: id,
            b: true,
            p: pxDown,
            s: sz,
            r: false,
            t: { limit: { tif: "Gtc" } },
        },
    });

    assertJsonSchema(schema, result);
    assertIncludesNotEmptyArray(result);

    // Closing orders after the test
    const openOrders = await publicClient.openOrders({ user: account.address });
    const cancels = openOrders.map((o) => ({ a: id, o: o.oid }));
    await walletClient.cancel({ cancels });
});
