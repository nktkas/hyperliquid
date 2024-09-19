import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.2";
import { createWalletClient, type Hex, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrumSepolia } from "viem/chains";
import { assertGreater } from "jsr:@std/assert@^1.0.4";
import { BigNumber } from "npm:bignumber.js@9.1.2";
import { HyperliquidExchangeClient, HyperliquidInfoClient } from "../index.ts";
import { assertJsonSchema, recursiveTraversal } from "./utils.ts";
import type { OrderResponse } from "../src/types/exchange.d.ts";

const TEST_PRIVATE_KEY: Hex = "0x";
const TEST_ASSET: string = "ETH";

Deno.test("HyperliquidExchangeClient", async (t) => {
    // Private key to WalletClient
    const walletAccount = privateKeyToAccount(TEST_PRIVATE_KEY);
    const walletClient = createWalletClient({ account: walletAccount, chain: arbitrumSepolia, transport: http() });

    // Create HyperliquidExchangeClient
    const exchangeClient = new HyperliquidExchangeClient(walletClient, "https://api.hyperliquid-testnet.xyz/exchange", false);

    // Create HyperliquidInfoClient
    const infoClient = new HyperliquidInfoClient("https://api.hyperliquid-testnet.xyz/info");

    // Get asset data
    const assetData = await infoClient.metaAndAssetCtxs();
    const assetId = assetData[0].universe.findIndex((u) => u.name === TEST_ASSET)!;
    const assetUniverse = assetData[0].universe[assetId];
    const assetCtx = assetData[1][assetId];

    // Calculate values for tests
    const pxDecimals = getPxDecimals("perp", assetUniverse.szDecimals);
    const testPxDown = new BigNumber(assetCtx.markPx)
        .times(0.99)
        .decimalPlaces(pxDecimals, BigNumber.ROUND_DOWN)
        .toString();
    const testPxUp = new BigNumber(assetCtx.markPx)
        .times(1.01)
        .decimalPlaces(pxDecimals, BigNumber.ROUND_DOWN)
        .toString();
    const testSz = new BigNumber(15)
        .div(assetCtx.markPx)
        .decimalPlaces(assetUniverse.szDecimals, BigNumber.ROUND_DOWN)
        .toString();

    // Create TypeScript type schemas
    const tsjSchemaGenerator = tsj.createGenerator({ path: resolve("./src/types/exchange.d.ts"), skipTypeCheck: true });

    // Test
    let orderTestData: OrderResponse;
    const orderTestResult = await t.step("order", async () => {
        orderTestData = await exchangeClient.order({
            orders: [{
                a: assetId,
                b: true,
                p: testPxDown,
                s: testSz,
                r: false,
                t: { limit: { tif: "Gtc" } },
            }],
            grouping: "na",
        });

        const schema = tsjSchemaGenerator.createSchema("OrderResponse");
        assertJsonSchema(schema, orderTestData);

        recursiveTraversal(orderTestData, (key, value) => {
            if (Array.isArray(value)) {
                assertGreater(value.length, 0, `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`);
            }
        });
    });

    await t.step({
        name: "cancel",
        fn: async () => {
            const data = await exchangeClient.cancel({
                cancels: orderTestData.response.data.statuses
                    .filter((status) => "resting" in status || "filled" in status)
                    .map((status) => ({
                        a: assetId,
                        o: "resting" in status ? status.resting.oid : status.filled.oid,
                    })),
            });

            const schema = tsjSchemaGenerator.createSchema("CancelResponse");
            assertJsonSchema(schema, data);

            recursiveTraversal(data, (key, value) => {
                if (Array.isArray(value)) {
                    assertGreater(
                        value.length,
                        0,
                        `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`,
                    );
                }
            });
        },
        ignore: !orderTestResult,
    });

    await t.step({
        name: "cancelByCloid",
        fn: async () => {
            // Preparation
            const orderRes = await exchangeClient.order({
                orders: [{
                    a: assetId,
                    b: true,
                    p: testPxDown,
                    s: testSz,
                    r: false,
                    t: { limit: { tif: "Gtc" } },
                    c: "0x1234567890abcdef1234567890abcdef",
                }],
                grouping: "na",
            });
            if ("error" in orderRes.response.data.statuses[0]) {
                throw new Error(`Failed to place an order: ${orderRes.response.data.statuses[0].error}`);
            }

            // Test
            const data = await exchangeClient.cancelByCloid({
                cancels: [
                    {
                        asset: assetId,
                        cloid: "0x1234567890abcdef1234567890abcdef",
                    },
                ],
            });

            const schema = tsjSchemaGenerator.createSchema("CancelResponse");
            assertJsonSchema(schema, data);

            recursiveTraversal(data, (key, value) => {
                if (Array.isArray(value)) {
                    assertGreater(
                        value.length,
                        0,
                        `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`,
                    );
                }
            });
        },
        ignore: !orderTestResult,
    });

    // Cannot set scheduled cancel time until enough volume traded (required: $1000000)
    await t.step({ name: "scheduleCancel", fn: () => {}, ignore: true });

    await t.step({
        name: "modify",
        fn: async () => {
            // Preparation
            const orderRes = await exchangeClient.order({
                orders: [{
                    a: assetId,
                    b: true,
                    p: testPxDown,
                    s: testSz,
                    r: false,
                    t: { limit: { tif: "Gtc" } },
                    c: "0x1234567890abcdef1234567890abcdef",
                }],
                grouping: "na",
            });
            if ("error" in orderRes.response.data.statuses[0]) {
                throw new Error(`Failed to place an order: ${orderRes.response.data.statuses[0].error}`);
            }
            const order = orderRes.response.data.statuses[0];

            // Test
            const data = await exchangeClient.modify({
                oid: "resting" in order ? order.resting.oid : order.filled.oid,
                order: {
                    a: assetId,
                    b: true,
                    p: testPxDown,
                    s: testSz,
                    r: false,
                    t: { limit: { tif: "Gtc" } },
                    c: "0x2234567890abcdef1234567890abcdef",
                },
            });

            const schema = tsjSchemaGenerator.createSchema("SuccessResponse");
            assertJsonSchema(schema, data);

            // Cleaning
            const infoClient = new HyperliquidInfoClient("https://api.hyperliquid-testnet.xyz/info");
            const openOrders = await infoClient.openOrders({ user: walletAccount.address });
            await exchangeClient.cancel({
                cancels: openOrders.map((openOrder) => ({ a: assetId, o: openOrder.oid })),
            });
        },
        ignore: !orderTestResult,
    });

    await t.step({
        name: "batchModify",
        fn: async () => {
            // Preparation
            const orderRes = await exchangeClient.order({
                orders: [{
                    a: assetId,
                    b: true,
                    p: testPxDown,
                    s: testSz,
                    r: false,
                    t: { limit: { tif: "Gtc" } },
                    c: "0x1234567890abcdef1234567890abcdef",
                }, {
                    a: assetId,
                    b: true,
                    p: testPxDown,
                    s: testSz,
                    r: false,
                    t: { limit: { tif: "Gtc" } },
                    c: "0x2234567890abcdef1234567890abcdef",
                }],
                grouping: "na",
            });

            const order1 = orderRes.response.data.statuses[0];
            const order2 = orderRes.response.data.statuses[1];

            if ("error" in order1 || "error" in order2) {
                throw new Error(`Failed to place an order: ${JSON.stringify(orderRes.response.data.statuses)}`);
            }

            // Test
            const data = await exchangeClient.batchModify({
                modifies: [
                    {
                        oid: "resting" in order1 ? order1.resting.oid : order1.filled.oid,
                        order: {
                            a: assetId,
                            b: true,
                            p: testPxDown,
                            s: testSz,
                            r: false,
                            t: { limit: { tif: "Gtc" } },
                            c: "0x3234567890abcdef1234567890abcdef",
                        },
                    },
                    {
                        oid: "resting" in order2 ? order2.resting.oid : order2.filled.oid,
                        order: {
                            a: assetId,
                            b: true,
                            p: testPxDown,
                            s: testSz,
                            r: false,
                            t: { limit: { tif: "Gtc" } },
                            c: "0x4234567890abcdef1234567890abcdef",
                        },
                    },
                ],
            });

            const schema = tsjSchemaGenerator.createSchema("OrderResponse");
            assertJsonSchema(schema, data);

            recursiveTraversal(data, (key, value) => {
                if (Array.isArray(value)) {
                    assertGreater(
                        value.length,
                        0,
                        `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`,
                    );
                }
            });

            // Cleaning
            const infoClient = new HyperliquidInfoClient("https://api.hyperliquid-testnet.xyz/info");
            const openOrders = await infoClient.openOrders({ user: walletAccount.address });
            await exchangeClient.cancel({
                cancels: openOrders.map((openOrder) => ({ a: assetId, o: openOrder.oid })),
            });
        },
        ignore: !orderTestResult,
    });

    await t.step("updateLeverage", async (t) => {
        await t.step("isCross === true", async () => {
            const data = await exchangeClient.updateLeverage({
                asset: assetId,
                isCross: true,
                leverage: 3,
            });

            const schema = tsjSchemaGenerator.createSchema("SuccessResponse");
            assertJsonSchema(schema, data);
        });

        await t.step("isCross === false", async () => {
            const data = await exchangeClient.updateLeverage({
                asset: assetId,
                isCross: false,
                leverage: 10,
            });

            const schema = tsjSchemaGenerator.createSchema("SuccessResponse");
            assertJsonSchema(schema, data);
        });
    });

    await t.step("updateIsolatedMargin", async (t) => {
        // Preparation
        await exchangeClient.order({
            orders: [{
                a: assetId,
                b: true,
                p: testPxUp,
                s: testSz,
                r: false,
                t: { limit: { tif: "Gtc" } },
            }],
            grouping: "na",
        });

        await t.step("isBuy === true", async () => {
            const data = await exchangeClient.updateIsolatedMargin({
                asset: assetId,
                isBuy: true,
                ntli: 1,
            });

            const schema = tsjSchemaGenerator.createSchema("SuccessResponse");
            assertJsonSchema(schema, data);
        });

        await t.step("isBuy === false", async () => {
            const data = await exchangeClient.updateIsolatedMargin({
                asset: assetId,
                isBuy: false,
                ntli: 1,
            });

            const schema = tsjSchemaGenerator.createSchema("SuccessResponse");
            assertJsonSchema(schema, data);
        });

        // Cleaning
        await exchangeClient.order({
            orders: [{
                a: assetId,
                b: false,
                p: testPxDown,
                s: "0", // Full position size
                r: true,
                t: { limit: { tif: "Gtc" } },
            }],
            grouping: "na",
        });
    });

    await t.step("usdSend", async () => {
        const data = await exchangeClient.usdSend({
            hyperliquidChain: "Testnet",
            signatureChainId: "0x66eee",
            destination: "0x0000000000000000000000000000000000000000",
            amount: "1",
            time: Date.now(),
        });

        const schema = tsjSchemaGenerator.createSchema("SuccessResponse");
        assertJsonSchema(schema, data);
    });

    await t.step("withdraw3", async () => {
        const data = await exchangeClient.withdraw3({
            hyperliquidChain: "Testnet",
            signatureChainId: "0x66eee",
            amount: "3", // 1 USD Fee
            time: Date.now(),
            destination: walletAccount.address,
        });

        const schema = tsjSchemaGenerator.createSchema("SuccessResponse");
        assertJsonSchema(schema, data);
    });

    const spotUser_test = await t.step("spotUser", async (t) => {
        await t.step("toPerp === false", async () => {
            const data = await exchangeClient.spotUser({
                usdc: 1000000,
                toPerp: false,
            });

            const schema = tsjSchemaGenerator.createSchema("SuccessResponse");
            assertJsonSchema(schema, data);
        });

        await t.step("toPerp === true", async () => {
            const data = await exchangeClient.spotUser({
                usdc: 1000000,
                toPerp: true,
            });

            const schema = tsjSchemaGenerator.createSchema("SuccessResponse");
            assertJsonSchema(schema, data);
        });
    });

    await t.step({
        name: "spotSend",
        fn: async () => {
            // Preparation
            await exchangeClient.spotUser({ usdc: 1000000, toPerp: false });

            // Test
            const data = await exchangeClient.spotSend({
                hyperliquidChain: "Testnet",
                signatureChainId: "0x66eee",
                destination: "0x0000000000000000000000000000000000000000",
                token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
                amount: "1",
                time: Date.now(),
            });

            const schema = tsjSchemaGenerator.createSchema("SuccessResponse");
            assertJsonSchema(schema, data);
        },
        ignore: !spotUser_test,
    });

    // It's not done yet
    await t.step({ name: "vaultTransfer", fn: () => {}, ignore: true });
});

function getPxDecimals(marketType: "perp" | "spot", szDecimals: number): number {
    const MAX_DECIMALS = marketType === "perp" ? 5 : 7;
    const maxPxDecimals = MAX_DECIMALS - szDecimals;
    return Math.max(0, maxPxDecimals);
}
