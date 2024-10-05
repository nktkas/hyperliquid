import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.2";
import { BigNumber } from "npm:bignumber.js@9.1.2";
import { assert } from "jsr:@std/assert@^1.0.4";
import { ExchangeClient, type Hex, InfoClient } from "../../index.ts";
import { assertJsonSchema, getAssetData, getPxDecimals } from "../utils.ts";

const TEST_PRIVATE_KEY = Deno.args[0];
const TEST_ASSET = Deno.args[1];

if (!isHex(TEST_PRIVATE_KEY)) {
    throw new Error(`Expected a hex string, but got ${TEST_PRIVATE_KEY}`);
}

Deno.test(
    "updateIsolatedMargin",
    { permissions: { net: true, read: true } },
    async (t) => {
        // Create viem account
        const account = privateKeyToAccount(TEST_PRIVATE_KEY);

        // Create hyperliquid clients
        const exchangeClient = new ExchangeClient(account, "https://api.hyperliquid-testnet.xyz/exchange", false);
        const infoClient = new InfoClient("https://api.hyperliquid-testnet.xyz/info");

        // Create TypeScript type schemas
        const tsjSchemaGenerator = tsj.createGenerator({ path: resolve("./src/types/exchange.d.ts"), skipTypeCheck: true });
        const schema = tsjSchemaGenerator.createSchema("SuccessResponse");

        // Get asset data
        const { id, universe, ctx } = await getAssetData(infoClient, TEST_ASSET);

        // Switch to isolated shoulder
        await exchangeClient.updateLeverage({
            asset: id,
            isCross: false,
            leverage: 10,
        });

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

        // Pre-test check
        const balance = await infoClient.clearinghouseState({ user: account.address });
        assert(
            new BigNumber(balance.withdrawable).isGreaterThanOrEqualTo("2062"), // Test 2047 USD + Open position 15 USD
            `Expected a balance greater than or equal to 2062, but got ${balance.withdrawable}`,
        );

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
        await t.step("isBuy === true", async (t) => {
            await t.step("ntli === 1", async () => {
                const result = await exchangeClient.updateIsolatedMargin({
                    asset: id,
                    isBuy: true,
                    ntli: 1,
                });

                assertJsonSchema(schema, result);
            });

            await t.step("ntli === 2", async () => {
                const result = await exchangeClient.updateIsolatedMargin({
                    asset: id,
                    isBuy: true,
                    ntli: 2,
                });

                assertJsonSchema(schema, result);
            });

            await t.step("ntli === 4", async () => {
                const result = await exchangeClient.updateIsolatedMargin({
                    asset: id,
                    isBuy: true,
                    ntli: 4,
                });

                assertJsonSchema(schema, result);
            });

            await t.step("ntli === 8", async () => {
                const result = await exchangeClient.updateIsolatedMargin({
                    asset: id,
                    isBuy: true,
                    ntli: 8,
                });

                assertJsonSchema(schema, result);
            });

            await t.step("ntli === 16", async () => {
                const result = await exchangeClient.updateIsolatedMargin({
                    asset: id,
                    isBuy: true,
                    ntli: 16,
                });

                assertJsonSchema(schema, result);
            });

            await t.step("ntli === 32", async () => {
                const result = await exchangeClient.updateIsolatedMargin({
                    asset: id,
                    isBuy: true,
                    ntli: 32,
                });

                assertJsonSchema(schema, result);
            });

            await t.step("ntli === 64", async () => {
                const result = await exchangeClient.updateIsolatedMargin({
                    asset: id,
                    isBuy: true,
                    ntli: 64,
                });

                assertJsonSchema(schema, result);
            });

            await t.step("ntli === 128", async () => {
                const result = await exchangeClient.updateIsolatedMargin({
                    asset: id,
                    isBuy: true,
                    ntli: 128,
                });

                assertJsonSchema(schema, result);
            });

            await t.step("ntli === 256", async () => {
                const result = await exchangeClient.updateIsolatedMargin({
                    asset: id,
                    isBuy: true,
                    ntli: 256,
                });

                assertJsonSchema(schema, result);
            });

            await t.step("ntli === 512", async () => {
                const result = await exchangeClient.updateIsolatedMargin({
                    asset: id,
                    isBuy: true,
                    ntli: 512,
                });

                assertJsonSchema(schema, result);
            });

            await t.step("ntli === 1024", async () => {
                const result = await exchangeClient.updateIsolatedMargin({
                    asset: id,
                    isBuy: true,
                    ntli: 1024,
                });

                assertJsonSchema(schema, result);
            });
        });

        await t.step("isBuy === false", async (t) => {
            await t.step("ntli === 1", async () => {
                const result = await exchangeClient.updateIsolatedMargin({
                    asset: id,
                    isBuy: false,
                    ntli: 1,
                });

                assertJsonSchema(schema, result);
            });

            await t.step("ntli === 2", async () => {
                const result = await exchangeClient.updateIsolatedMargin({
                    asset: id,
                    isBuy: false,
                    ntli: 2,
                });

                assertJsonSchema(schema, result);
            });

            await t.step("ntli === 4", async () => {
                const result = await exchangeClient.updateIsolatedMargin({
                    asset: id,
                    isBuy: false,
                    ntli: 4,
                });

                assertJsonSchema(schema, result);
            });

            await t.step("ntli === 8", async () => {
                const result = await exchangeClient.updateIsolatedMargin({
                    asset: id,
                    isBuy: false,
                    ntli: 8,
                });

                assertJsonSchema(schema, result);
            });

            await t.step("ntli === 16", async () => {
                const result = await exchangeClient.updateIsolatedMargin({
                    asset: id,
                    isBuy: false,
                    ntli: 16,
                });

                assertJsonSchema(schema, result);
            });

            await t.step("ntli === 32", async () => {
                const result = await exchangeClient.updateIsolatedMargin({
                    asset: id,
                    isBuy: false,
                    ntli: 32,
                });

                assertJsonSchema(schema, result);
            });

            await t.step("ntli === 64", async () => {
                const result = await exchangeClient.updateIsolatedMargin({
                    asset: id,
                    isBuy: false,
                    ntli: 64,
                });

                assertJsonSchema(schema, result);
            });

            await t.step("ntli === 128", async () => {
                const result = await exchangeClient.updateIsolatedMargin({
                    asset: id,
                    isBuy: false,
                    ntli: 128,
                });

                assertJsonSchema(schema, result);
            });

            await t.step("ntli === 256", async () => {
                const result = await exchangeClient.updateIsolatedMargin({
                    asset: id,
                    isBuy: false,
                    ntli: 256,
                });

                assertJsonSchema(schema, result);
            });

            await t.step("ntli === 512", async () => {
                const result = await exchangeClient.updateIsolatedMargin({
                    asset: id,
                    isBuy: false,
                    ntli: 512,
                });

                assertJsonSchema(schema, result);
            });

            await t.step("ntli === 1024", async () => {
                const result = await exchangeClient.updateIsolatedMargin({
                    asset: id,
                    isBuy: false,
                    ntli: 1024,
                });

                assertJsonSchema(schema, result);
            });
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
    },
);

function isHex(data: unknown): data is Hex {
    return typeof data === "string" && /^0x[0-9a-fA-F]+$/.test(data);
}
