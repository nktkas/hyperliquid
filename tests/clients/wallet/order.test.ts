import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import { BigNumber } from "npm:bignumber.js@^9.1.2";
import { assert } from "jsr:@std/assert@^1.0.10";
import {
    assertIncludesNotEmptyArray,
    assertJsonSchema,
    getAssetData,
    getPxDecimals,
    isHex,
    randomCloid,
} from "../../utils.ts";
import { HttpTransport, PublicClient, WalletClient } from "../../../index.ts";

const TEST_PRIVATE_KEY = Deno.args[0];
const TEST_ASSET = "ETH";
if (!isHex(TEST_PRIVATE_KEY)) {
    throw new Error(`Expected a hex string, but got ${typeof TEST_PRIVATE_KEY}`);
}

Deno.test("order", async (t) => {
    // Create a scheme of type
    const typeSchema = tsj
        .createGenerator({ path: "./index.ts", skipTypeCheck: true })
        .createSchema("OrderResponseSuccess");

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

    // Test
    await t.step("unfilled + without cloid", async () => {
        const result = await walletClient.order({
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
        const [order] = result.response.data.statuses;

        assertJsonSchema(typeSchema, result);
        assertIncludesNotEmptyArray(result);
        assert("resting" in result.response.data.statuses[0], "resting is not defined");
        assert(result.response.data.statuses[0].resting.cloid === undefined, "cloid is defined");

        // Closing orders after the test
        await walletClient.cancel({
            cancels: [{ a: id, o: "resting" in order ? order.resting.oid : order.filled.oid }],
        });
    });

    await t.step("unfilled + with cloid", async () => {
        const result = await walletClient.order({
            orders: [
                {
                    a: id,
                    b: true,
                    p: pxDown,
                    s: sz,
                    r: false,
                    t: { limit: { tif: "Gtc" } },
                    c: randomCloid(),
                },
            ],
            grouping: "na",
        });
        const [order] = result.response.data.statuses;

        assertJsonSchema(typeSchema, result);
        assertIncludesNotEmptyArray(result);
        assert("resting" in result.response.data.statuses[0], "resting is not defined");
        assert(result.response.data.statuses[0].resting.cloid !== undefined, "cloid is not defined");

        // Closing orders after the test
        await walletClient.cancel({
            cancels: [{ a: id, o: "resting" in order ? order.resting.oid : order.filled.oid }],
        });
    });

    await t.step("filled + without cloid", async () => {
        const result = await walletClient.order({
            orders: [
                {
                    a: id,
                    b: true,
                    p: pxUp,
                    s: sz,
                    r: false,
                    t: { limit: { tif: "Gtc" } },
                },
            ],
            grouping: "na",
        });

        assertJsonSchema(typeSchema, result);
        assertIncludesNotEmptyArray(result);
        assert("filled" in result.response.data.statuses[0], "filled is not defined");
        assert(result.response.data.statuses[0].filled.cloid === undefined, "cloid is defined");

        // Closing orders after the test
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

    await t.step("filled + with cloid", async () => {
        const result = await walletClient.order({
            orders: [
                {
                    a: id,
                    b: true,
                    p: pxUp,
                    s: sz,
                    r: false,
                    t: { limit: { tif: "Gtc" } },
                    c: randomCloid(),
                },
            ],
            grouping: "na",
        });

        assertJsonSchema(typeSchema, result);
        assertIncludesNotEmptyArray(result);
        assert("filled" in result.response.data.statuses[0], "filled is not defined");
        assert(result.response.data.statuses[0].filled.cloid !== undefined, "cloid is not defined");

        // Closing orders after the test
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

    await t.step("unfilled + builder", async () => {
        const result = await walletClient.order({
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
            builder: { b: account.address, f: 1 },
        });
        const [order] = result.response.data.statuses;

        assertJsonSchema(typeSchema, result);
        assertIncludesNotEmptyArray(result);

        // Closing orders after the test
        await walletClient.cancel({
            cancels: [{ a: id, o: "resting" in order ? order.resting.oid : order.filled.oid }],
        });
    });
});
