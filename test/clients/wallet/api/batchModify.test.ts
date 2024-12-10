import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.2";
import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import { BigNumber } from "npm:bignumber.js@^9.1.2";
import { assert } from "jsr:@std/assert@^1.0.9";
import {
    assertIncludesNotEmptyArray,
    assertJsonSchema,
    getAssetData,
    getPxDecimals,
    isHex,
    randomCloid,
} from "../../../utils.ts";
import { HttpTransport, PublicClient, WalletClient } from "../../../../index.ts";

const TEST_PRIVATE_KEY = Deno.args[0];
const TEST_ASSET = "ETH";
if (!isHex(TEST_PRIVATE_KEY)) {
    throw new Error(`Expected a hex string, but got ${typeof TEST_PRIVATE_KEY}`);
}

Deno.test("batchModify", async (t) => {
    // Create TypeScript type schemas
    const tsjSchemaGenerator = tsj.createGenerator({ path: resolve("./index.ts"), skipTypeCheck: true });
    const schema = tsjSchemaGenerator.createSchema("OrderResponseSuccess");

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
    const pxUp = new BigNumber(ctx.markPx)
        .times(1.01)
        .dp(pxDecimals, BigNumber.ROUND_DOWN)
        .toString();
    const pxDown = new BigNumber(ctx.markPx)
        .times(0.99)
        .dp(pxDecimals, BigNumber.ROUND_DOWN)
        .toString();
    const sz = new BigNumber(15) // USD
        .div(ctx.markPx)
        .dp(universe.szDecimals, BigNumber.ROUND_DOWN)
        .toString();

    // Test
    await t.step("unfilled + without cloid", async () => {
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
        const result = await walletClient.batchModify({
            modifies: [
                {
                    oid: "resting" in order ? order.resting.oid : order.filled.oid,
                    order: {
                        a: id,
                        b: true,
                        p: pxDown,
                        s: sz,
                        r: false,
                        t: { limit: { tif: "Gtc" } },
                    },
                },
            ],
        });
        const [newOrder] = result.response.data.statuses;

        assertJsonSchema(schema, result);
        assertIncludesNotEmptyArray(result);
        assert("resting" in result.response.data.statuses[0], "resting is not defined");
        assert(result.response.data.statuses[0].resting.cloid === undefined, "cloid is defined");

        // Closing orders after the test
        await walletClient.cancel({
            cancels: [{ a: id, o: "resting" in newOrder ? newOrder.resting.oid : newOrder.filled.oid }],
        });
    });

    await t.step("unfilled + with cloid", async () => {
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
        const result = await walletClient.batchModify({
            modifies: [
                {
                    oid: "resting" in order ? order.resting.oid : order.filled.oid,
                    order: {
                        a: id,
                        b: true,
                        p: pxDown,
                        s: sz,
                        r: false,
                        t: { limit: { tif: "Gtc" } },
                        c: randomCloid(),
                    },
                },
            ],
        });
        const [newOrder] = result.response.data.statuses;

        assertJsonSchema(schema, result);
        assertIncludesNotEmptyArray(result);
        assert("resting" in result.response.data.statuses[0], "resting is not defined");
        assert(result.response.data.statuses[0].resting.cloid !== undefined, "cloid is not defined");

        // Closing orders after the test
        await walletClient.cancel({
            cancels: [{ a: id, o: "resting" in newOrder ? newOrder.resting.oid : newOrder.filled.oid }],
        });
    });

    await t.step("filled + without cloid", async () => {
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
        const result = await walletClient.batchModify({
            modifies: [
                {
                    oid: "resting" in order ? order.resting.oid : order.filled.oid,
                    order: {
                        a: id,
                        b: true,
                        p: pxUp,
                        s: sz,
                        r: false,
                        t: { limit: { tif: "Gtc" } },
                    },
                },
            ],
        });

        assertJsonSchema(schema, result);
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
        const result = await walletClient.batchModify({
            modifies: [
                {
                    oid: "resting" in order ? order.resting.oid : order.filled.oid,
                    order: {
                        a: id,
                        b: true,
                        p: pxUp,
                        s: sz,
                        r: false,
                        t: { limit: { tif: "Gtc" } },
                        c: randomCloid(),
                    },
                },
            ],
        });

        assertJsonSchema(schema, result);
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
});
