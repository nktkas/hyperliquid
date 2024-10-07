import { ExchangeClient, InfoClient } from "../../index.ts";
import { getAssetData, getPxDecimals, isHex, randomCloid, recursiveTraversal } from "../utils.ts";
import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.2";
import { assert, assertGreater } from "jsr:@std/assert@^1.0.4";
import { BigNumber } from "npm:bignumber.js@9.1.2";
import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import { assertJsonSchema } from "../utils.ts";

const TEST_PRIVATE_KEY = Deno.args[0];
const TEST_ASSET = Deno.args[1];

if (!isHex(TEST_PRIVATE_KEY)) {
    throw new Error(`Expected a hex string, but got ${TEST_PRIVATE_KEY}`);
}

Deno.test(
    "batchModify",
    { permissions: { net: true, read: true } },
    async (t) => {
        // Create client
        const account = privateKeyToAccount(TEST_PRIVATE_KEY);
        const exchangeClient = new ExchangeClient(account, "https://api.hyperliquid-testnet.xyz/exchange", false);
        const infoClient = new InfoClient("https://api.hyperliquid-testnet.xyz/info");

        // Create TypeScript type schemas
        const tsjSchemaGenerator = tsj.createGenerator({ path: resolve("./src/exchange.ts"), skipTypeCheck: true });
        const schema = tsjSchemaGenerator.createSchema("OrderResponseSuccess");

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
    },
);
