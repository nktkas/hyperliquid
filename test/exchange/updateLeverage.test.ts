import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.2";
import { ExchangeClient, type Hex, InfoClient } from "../../index.ts";
import { assertJsonSchema, getAssetData } from "../utils.ts";

const TEST_PRIVATE_KEY = Deno.args[0];
const TEST_ASSET = Deno.args[1];

if (!isHex(TEST_PRIVATE_KEY)) {
    throw new Error(`Expected a hex string, but got ${TEST_PRIVATE_KEY}`);
}

Deno.test(
    "updateLeverage",
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
        const { id } = await getAssetData(infoClient, TEST_ASSET);

        // Test
        await t.step("isCross === true", async (t) => {
            await t.step("leverage === 1", async () => {
                const result = await exchangeClient.updateLeverage({
                    asset: id,
                    isCross: true,
                    leverage: 1,
                });

                assertJsonSchema(schema, result);
            });

            await t.step("leverage === 2", async () => {
                const result = await exchangeClient.updateLeverage({
                    asset: id,
                    isCross: true,
                    leverage: 2,
                });

                assertJsonSchema(schema, result);
            });

            await t.step("leverage === 4", async () => {
                const result = await exchangeClient.updateLeverage({
                    asset: id,
                    isCross: true,
                    leverage: 4,
                });

                assertJsonSchema(schema, result);
            });

            await t.step("leverage === 8", async () => {
                const result = await exchangeClient.updateLeverage({
                    asset: id,
                    isCross: true,
                    leverage: 8,
                });

                assertJsonSchema(schema, result);
            });

            await t.step("leverage === 16", async () => {
                const result = await exchangeClient.updateLeverage({
                    asset: id,
                    isCross: true,
                    leverage: 16,
                });

                assertJsonSchema(schema, result);
            });

            await t.step("leverage === 32", async () => {
                const result = await exchangeClient.updateLeverage({
                    asset: id,
                    isCross: true,
                    leverage: 32,
                });

                assertJsonSchema(schema, result);
            });

            await t.step("leverage === 50 (max)", async () => {
                const result = await exchangeClient.updateLeverage({
                    asset: id,
                    isCross: true,
                    leverage: 50,
                });

                assertJsonSchema(schema, result);
            });
        });

        await t.step("isCross === false", async (t) => {
            await t.step("leverage === 1", async () => {
                const result = await exchangeClient.updateLeverage({
                    asset: id,
                    isCross: false,
                    leverage: 1,
                });

                assertJsonSchema(schema, result);
            });

            await t.step("leverage === 2", async () => {
                const result = await exchangeClient.updateLeverage({
                    asset: id,
                    isCross: false,
                    leverage: 2,
                });

                assertJsonSchema(schema, result);
            });

            await t.step("leverage === 4", async () => {
                const result = await exchangeClient.updateLeverage({
                    asset: id,
                    isCross: false,
                    leverage: 4,
                });

                assertJsonSchema(schema, result);
            });

            await t.step("leverage === 8", async () => {
                const result = await exchangeClient.updateLeverage({
                    asset: id,
                    isCross: false,
                    leverage: 8,
                });

                assertJsonSchema(schema, result);
            });

            await t.step("leverage === 16", async () => {
                const result = await exchangeClient.updateLeverage({
                    asset: id,
                    isCross: false,
                    leverage: 16,
                });

                assertJsonSchema(schema, result);
            });

            await t.step("leverage === 32", async () => {
                const result = await exchangeClient.updateLeverage({
                    asset: id,
                    isCross: false,
                    leverage: 32,
                });

                assertJsonSchema(schema, result);
            });

            await t.step("leverage === 50 (max)", async () => {
                const result = await exchangeClient.updateLeverage({
                    asset: id,
                    isCross: false,
                    leverage: 50,
                });

                assertJsonSchema(schema, result);
            });
        });
    },
);

function isHex(data: unknown): data is Hex {
    return typeof data === "string" && /^0x[0-9a-fA-F]+$/.test(data);
}
