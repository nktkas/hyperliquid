import { ExchangeClient, InfoClient, WebSocketTransport } from "../index.ts";
import { assertJsonSchema, generateEthereumAddress, getAssetData, getPxDecimals, isHex, randomCloid, recursiveTraversal } from "./utils.ts";
import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.2";
import { assert, assertGreater } from "jsr:@std/assert@^1.0.4";
import { generatePrivateKey, privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import { BigNumber } from "npm:bignumber.js@^9.1.2";

const TEST_PRIVATE_KEY = Deno.args[0];
const TEST_ASSET = "ETH";
const TEST_SUB_ACCOUNT_ADDRESS = "0xcb3f0bd249a89e45e86a44bcfc7113e4ffe84cd1";
const TEST_VAULT_ADDRESS = "0x1719884eb866cb12b2287399b15f7db5e7d775ea";

if (!isHex(TEST_PRIVATE_KEY)) {
    throw new Error(`Expected a hex string, but got ${typeof TEST_PRIVATE_KEY}`);
}

Deno.test("Exchange Endpoints Tests + WebSocketTransport", async (t) => {
    // Create client
    const account = privateKeyToAccount(TEST_PRIVATE_KEY);
    const transport = new WebSocketTransport({ url: "wss://api.hyperliquid-testnet.xyz/ws" });
    const exchangeClient = new ExchangeClient(account, transport, true);
    const infoClient = new InfoClient(transport);

    // Create TypeScript type schemas
    const tsjSchemaGenerator = tsj.createGenerator({ path: resolve("./src/endpoints/types/exchange.d.ts"), skipTypeCheck: true });
    const schema = tsjSchemaGenerator.createSchema();

    // Tests
    await t.step("approveAgent", async () => {
        const result = await exchangeClient.approveAgent({
            hyperliquidChain: "Testnet",
            signatureChainId: "0x66eee",
            agentAddress: generateEthereumAddress(),
            agentName: "agentName",
            nonce: Date.now(),
        });

        assertJsonSchema(schema, result);
    });

    await t.step("approveBuilderFee", async () => {
        const result = await exchangeClient.approveBuilderFee({
            hyperliquidChain: "Testnet",
            signatureChainId: "0x66eee",
            maxFeeRate: "0.001%",
            builder: account.address,
            nonce: Date.now(),
        });

        assertJsonSchema(schema, result);
    });

    await t.step("batchModify", async (t) => {
        // Get asset data
        const { id, universe, ctx } = await getAssetData(infoClient, TEST_ASSET);

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
        await t.step("statuses === resting + cloid === undefined", async () => {
            // Preparation of orders
            const openOrderRes = await exchangeClient.order({
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
            const [order1] = openOrderRes.response.data.statuses;

            // Test
            const result = await exchangeClient.batchModify({
                modifies: [
                    {
                        oid: "resting" in order1 ? order1.resting.oid : order1.filled.oid,
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

            assertJsonSchema(schema, result);
            recursiveTraversal(result, (key, value) => {
                if (Array.isArray(value)) {
                    assertGreater(
                        value.length,
                        0,
                        `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`,
                    );
                }
            });
            assert("resting" in result.response.data.statuses[0], "resting is not defined");
            assert(result.response.data.statuses[0].resting.cloid === undefined, "cloid is defined");

            // Closing orders after the test
            const openOrders = await infoClient.openOrders({ user: account.address });
            const cancels = openOrders.map((o) => ({ a: id, o: o.oid }));
            await exchangeClient.cancel({ cancels });
        });

        await t.step("statuses === resting + cloid !== undefined", async () => {
            // Preparation of orders
            const openOrderRes = await exchangeClient.order({
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
            const [order1] = openOrderRes.response.data.statuses;

            // Test
            const result = await exchangeClient.batchModify({
                modifies: [
                    {
                        oid: "resting" in order1 ? order1.resting.oid : order1.filled.oid,
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

            assertJsonSchema(schema, result);
            recursiveTraversal(result, (key, value) => {
                if (Array.isArray(value)) {
                    assertGreater(
                        value.length,
                        0,
                        `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`,
                    );
                }
            });
            assert("resting" in result.response.data.statuses[0], "resting is not defined");
            assert(result.response.data.statuses[0].resting.cloid !== undefined, "cloid is not defined");

            // Closing orders after the test
            const openOrders = await infoClient.openOrders({ user: account.address });
            const cancels = openOrders.map((o) => ({ a: id, o: o.oid }));
            await exchangeClient.cancel({ cancels });
        });

        await t.step("statuses === filled + cloid === undefined", async () => {
            // Preparation of orders
            const openOrderRes = await exchangeClient.order({
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
            const [order1] = openOrderRes.response.data.statuses;

            // Test
            const result = await exchangeClient.batchModify({
                modifies: [
                    {
                        oid: "resting" in order1 ? order1.resting.oid : order1.filled.oid,
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
            recursiveTraversal(result, (key, value) => {
                if (Array.isArray(value)) {
                    assertGreater(
                        value.length,
                        0,
                        `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`,
                    );
                }
            });
            assert("filled" in result.response.data.statuses[0], "filled is not defined");
            assert(result.response.data.statuses[0].filled.cloid === undefined, "cloid is defined");

            // Closing orders after the test
            await exchangeClient.order({
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

        await t.step("statuses === filled + cloid !== undefined", async () => {
            // Preparation of orders
            const openOrderRes = await exchangeClient.order({
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
            const [order1] = openOrderRes.response.data.statuses;

            // Test
            const result = await exchangeClient.batchModify({
                modifies: [
                    {
                        oid: "resting" in order1 ? order1.resting.oid : order1.filled.oid,
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
            recursiveTraversal(result, (key, value) => {
                if (Array.isArray(value)) {
                    assertGreater(
                        value.length,
                        0,
                        `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`,
                    );
                }
            });
            assert("filled" in result.response.data.statuses[0], "filled is not defined");
            assert(result.response.data.statuses[0].filled.cloid !== undefined, "cloid is not defined");

            // Closing orders after the test
            await exchangeClient.order({
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

    await t.step("cancel", async () => {
        // Get asset data
        const { id, universe, ctx } = await getAssetData(infoClient, TEST_ASSET);

        // Calculations
        const pxDecimals = getPxDecimals("perp", universe.szDecimals);
        const pxDown = new BigNumber(ctx.markPx)
            .times(0.99)
            .decimalPlaces(pxDecimals, BigNumber.ROUND_DOWN)
            .toString();
        const sz = new BigNumber(11) // USD
            .div(ctx.markPx)
            .decimalPlaces(universe.szDecimals, BigNumber.ROUND_DOWN)
            .toString();

        // Change leverage
        await exchangeClient.updateLeverage({
            asset: id,
            isCross: true,
            leverage: 10,
        });

        // Preparation of orders
        const openOrderRes = await exchangeClient.order({
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
        const [order1] = openOrderRes.response.data.statuses;

        // Test
        const result = await exchangeClient.cancel({
            cancels: [{
                a: id,
                o: "resting" in order1 ? order1.resting.oid : order1.filled.oid,
            }],
        });

        assertJsonSchema(schema, result);
        recursiveTraversal(result, (key, value) => {
            if (Array.isArray(value)) {
                assertGreater(
                    value.length,
                    0,
                    `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`,
                );
            }
        });
    });

    await t.step("cancelByCloid", async () => {
        // Get asset data
        const { id, universe, ctx } = await getAssetData(infoClient, TEST_ASSET);

        // Calculations
        const pxDecimals = getPxDecimals("perp", universe.szDecimals);
        const pxDown = new BigNumber(ctx.markPx)
            .times(0.99)
            .decimalPlaces(pxDecimals, BigNumber.ROUND_DOWN)
            .toString();
        const sz = new BigNumber(11) // USD
            .div(ctx.markPx)
            .decimalPlaces(universe.szDecimals, BigNumber.ROUND_DOWN)
            .toString();

        // Change leverage
        await exchangeClient.updateLeverage({
            asset: id,
            isCross: true,
            leverage: 10,
        });

        // Preparation of orders
        const openOrderRes = await exchangeClient.order({
            orders: [{
                a: id,
                b: true,
                p: pxDown,
                s: sz,
                r: false,
                t: { limit: { tif: "Gtc" } },
                c: randomCloid(),
            }],
            grouping: "na",
        });
        const [order1] = openOrderRes.response.data.statuses;

        // Test
        const result = await exchangeClient.cancelByCloid({
            cancels: [{
                asset: id,
                cloid: "resting" in order1 ? order1.resting.cloid! : order1.filled.cloid!,
            }],
        });

        assertJsonSchema(schema, result);
        recursiveTraversal(result, (key, value) => {
            if (Array.isArray(value)) {
                assertGreater(
                    value.length,
                    0,
                    `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`,
                );
            }
        });
    });

    // The test is ignored because: Only 10 sub-accounts can be created. And for a temporary wallet you need to somehow trade $100000 in volume
    await t.step({
        name: "createSubAccount",
        ignore: true,
        fn: async () => {
            const result = await exchangeClient.createSubAccount({ name: String(Date.now()) });
            assertJsonSchema(schema, result);
        },
    });

    await t.step("modify", async () => {
        // Get asset data
        const { id, universe, ctx } = await getAssetData(infoClient, TEST_ASSET);

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
        const openOrderRes = await exchangeClient.order({
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
        const [order1] = openOrderRes.response.data.statuses;

        // Test
        const result = await exchangeClient.modify({
            oid: "resting" in order1 ? order1.resting.oid : order1.filled.oid,
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
        recursiveTraversal(result, (key, value) => {
            if (Array.isArray(value)) {
                assertGreater(
                    value.length,
                    0,
                    `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`,
                );
            }
        });

        // Closing orders after the test
        const openOrders = await infoClient.openOrders({ user: account.address });
        const cancels = openOrders.map((o) => ({ a: id, o: o.oid }));
        await exchangeClient.cancel({ cancels });
    });

    await t.step("order", async (t) => {
        // Get asset data
        const { id, universe, ctx } = await getAssetData(infoClient, TEST_ASSET);

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
        await t.step("statuses === resting + cloid === undefined", async () => {
            // Test
            const result = await exchangeClient.order({
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

            assertJsonSchema(schema, result);
            recursiveTraversal(result, (key, value) => {
                if (Array.isArray(value)) {
                    assertGreater(
                        value.length,
                        0,
                        `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`,
                    );
                }
            });
            assert("resting" in result.response.data.statuses[0], "resting is not defined");
            assert(result.response.data.statuses[0].resting.cloid === undefined, "cloid is defined");

            // Closing orders after the test
            const openOrders = await infoClient.openOrders({ user: account.address });
            const cancels = openOrders.map((o) => ({ a: id, o: o.oid }));
            await exchangeClient.cancel({ cancels });
        });

        await t.step("statuses === resting + cloid !== undefined", async () => {
            // Test
            const result = await exchangeClient.order({
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

            assertJsonSchema(schema, result);
            recursiveTraversal(result, (key, value) => {
                if (Array.isArray(value)) {
                    assertGreater(
                        value.length,
                        0,
                        `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`,
                    );
                }
            });
            assert("resting" in result.response.data.statuses[0], "resting is not defined");
            assert(result.response.data.statuses[0].resting.cloid !== undefined, "cloid is not defined");

            // Closing orders after the test
            const openOrders = await infoClient.openOrders({ user: account.address });
            const cancels = openOrders.map((o) => ({ a: id, o: o.oid }));
            await exchangeClient.cancel({ cancels });
        });

        await t.step("statuses === filled + cloid === undefined", async () => {
            // Test
            const result = await exchangeClient.order({
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

            assertJsonSchema(schema, result);
            recursiveTraversal(result, (key, value) => {
                if (Array.isArray(value)) {
                    assertGreater(
                        value.length,
                        0,
                        `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`,
                    );
                }
            });
            assert("filled" in result.response.data.statuses[0], "filled is not defined");
            assert(result.response.data.statuses[0].filled.cloid === undefined, "cloid is defined");

            // Closing orders after the test
            await exchangeClient.order({
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

        await t.step("statuses === filled + cloid !== undefined", async () => {
            // Test
            const result = await exchangeClient.order({
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

            assertJsonSchema(schema, result);
            recursiveTraversal(result, (key, value) => {
                if (Array.isArray(value)) {
                    assertGreater(
                        value.length,
                        0,
                        `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`,
                    );
                }
            });
            assert("filled" in result.response.data.statuses[0], "filled is not defined");
            assert(result.response.data.statuses[0].filled.cloid !== undefined, "cloid is not defined");

            // Closing orders after the test
            await exchangeClient.order({
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

        await t.step("builder", async () => {
            // Test
            const result = await exchangeClient.order({
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

            assertJsonSchema(schema, result);
            recursiveTraversal(result, (key, value) => {
                if (Array.isArray(value)) {
                    assertGreater(
                        value.length,
                        0,
                        `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`,
                    );
                }
            });

            // Closing orders after the test
            const openOrders = await infoClient.openOrders({ user: account.address });
            const cancels = openOrders.map((o) => ({ a: id, o: o.oid }));
            await exchangeClient.cancel({ cancels });
        });
    });

    await t.step("scheduleCancel", async () => {
        const result = await exchangeClient.scheduleCancel({ time: Date.now() + 10000 });
        assertJsonSchema(schema, result);
    });

    await t.step("setReferrer", async () => {
        // Preparing a temporary wallet
        const tempPrivKey = generatePrivateKey();
        const tempAccount = privateKeyToAccount(tempPrivKey);
        const tempExchangeClient = new ExchangeClient(tempAccount, transport, true);

        await exchangeClient.usdSend({
            hyperliquidChain: "Testnet",
            signatureChainId: "0x66eee",
            destination: tempAccount.address,
            amount: "2",
            time: Date.now(),
        });

        // Test
        const result = await tempExchangeClient.setReferrer({ code: "TEST" });
        assertJsonSchema(schema, result);
    });

    await t.step("spotSend", async () => {
        // Preparation of balance
        await exchangeClient.usdClassTransfer({
            hyperliquidChain: "Testnet",
            signatureChainId: "0x66eee",
            amount: "1",
            toPerp: false,
            nonce: Date.now(),
        });

        // Test
        const result = await exchangeClient.spotSend({
            hyperliquidChain: "Testnet",
            signatureChainId: "0x66eee",
            destination: generateEthereumAddress(),
            token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
            amount: "1",
            time: Date.now(),
        });
        assertJsonSchema(schema, result);
    });

    await t.step("subAccountTransfer", async (t) => {
        await t.step("isDeposit === true", async () => {
            const result = await exchangeClient.subAccountTransfer({
                subAccountUser: TEST_SUB_ACCOUNT_ADDRESS,
                isDeposit: true,
                usd: 1,
            });

            assertJsonSchema(schema, result);
        });

        await t.step("isDeposit === false", async () => {
            const result = await exchangeClient.subAccountTransfer({
                subAccountUser: TEST_SUB_ACCOUNT_ADDRESS,
                isDeposit: false,
                usd: 1,
            });

            assertJsonSchema(schema, result);
        });
    });

    await t.step("updateIsolatedMargin", async (t) => {
        // Get asset data
        const { id, universe, ctx } = await getAssetData(infoClient, TEST_ASSET);

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
        await exchangeClient.updateLeverage({
            asset: id,
            isCross: false,
            leverage: 10,
        });

        // Preparing position
        await exchangeClient.order({
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
        await t.step("isBuy === true", async () => {
            const result = await exchangeClient.updateIsolatedMargin({
                asset: id,
                isBuy: true,
                ntli: 1,
            });

            assertJsonSchema(schema, result);
        });

        await t.step("isBuy === false", async () => {
            const result = await exchangeClient.updateIsolatedMargin({
                asset: id,
                isBuy: false,
                ntli: 1,
            });

            assertJsonSchema(schema, result);
        });

        // Post test cleaning
        await exchangeClient.order({
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

    await t.step("updateLeverage", async (t) => {
        // Get asset data
        const { id } = await getAssetData(infoClient, TEST_ASSET);

        // Test
        await t.step("isCross === true", async () => {
            const result = await exchangeClient.updateLeverage({
                asset: id,
                isCross: true,
                leverage: 1,
            });

            assertJsonSchema(schema, result);
        });

        await t.step("isCross === false", async () => {
            const result = await exchangeClient.updateLeverage({
                asset: id,
                isCross: false,
                leverage: 1,
            });

            assertJsonSchema(schema, result);
        });
    });

    await t.step("usdClassTransfer", async (t) => {
        await t.step("toPerp === false", async () => {
            const result = await exchangeClient.usdClassTransfer({
                hyperliquidChain: "Testnet",
                signatureChainId: "0x66eee",
                amount: "1",
                toPerp: false,
                nonce: Date.now(),
            });

            assertJsonSchema(schema, result);
        });

        await t.step("toPerp === true", async () => {
            const result = await exchangeClient.usdClassTransfer({
                hyperliquidChain: "Testnet",
                signatureChainId: "0x66eee",
                amount: "1",
                toPerp: true,
                nonce: Date.now(),
            });

            assertJsonSchema(schema, result);
        });
    });

    await t.step("usdSend", async () => {
        const result = await exchangeClient.usdSend({
            hyperliquidChain: "Testnet",
            signatureChainId: "0x66eee",
            destination: generateEthereumAddress(),
            amount: "2", // 1 USD fee
            time: Date.now(),
        });

        assertJsonSchema(schema, result);
    });

    await t.step("vaultTransfer", async (t) => {
        await t.step("isDeposit === false", async () => {
            const result = await exchangeClient.vaultTransfer({
                vaultAddress: TEST_VAULT_ADDRESS,
                isDeposit: false,
                usd: 5000000, // 5 USD minimum
            });

            assertJsonSchema(schema, result);
        });

        await t.step("isDeposit === true", async () => {
            const result = await exchangeClient.vaultTransfer({
                vaultAddress: TEST_VAULT_ADDRESS,
                isDeposit: true,
                usd: 5000000, // 5 USD minimum
            });

            assertJsonSchema(schema, result);
        });
    });

    await t.step("withdraw3", async () => {
        const result = await exchangeClient.withdraw3({
            hyperliquidChain: "Testnet",
            signatureChainId: "0x66eee",
            amount: "2",
            time: Date.now(),
            destination: account.address,
        });
        assertJsonSchema(schema, result);
    });

    // Clean up
    await transport.close();
});
