import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.2";
import { assert } from "jsr:@std/assert@^1.0.4";
import { BigNumber } from "npm:bignumber.js@9.1.2";
import { ExchangeClient, type Hex, InfoClient } from "../../index.ts";
import { assertJsonSchema } from "../utils.ts";

const TEST_PRIVATE_KEY = Deno.args[0];
const TEST_SUB_ACCOUNT_ADDRESS = Deno.args[3];

if (!isHex(TEST_PRIVATE_KEY)) {
    throw new Error(`Expected a hex string, but got ${TEST_PRIVATE_KEY}`);
}
if (!isHex(TEST_SUB_ACCOUNT_ADDRESS)) {
    throw new Error(`Expected a hex string, but got ${TEST_SUB_ACCOUNT_ADDRESS}`);
}

Deno.test(
    "subAccountTransfer",
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

        // Pre-test check
        const balance = await infoClient.clearinghouseState({ user: account.address });
        assert(
            new BigNumber(balance.withdrawable).isGreaterThanOrEqualTo("1.371738"),
            `Expected a balance greater than or equal to 1.371738 but got ${balance.withdrawable}`,
        );

        // Test
        await t.step("isDeposit === true", async (t) => {
            await t.step("usd === 1", async () => {
                const result = await exchangeClient.subAccountTransfer({
                    subAccountUser: TEST_SUB_ACCOUNT_ADDRESS,
                    isDeposit: true,
                    usd: 1,
                });

                assertJsonSchema(schema, result);
            });

            await t.step("usd === 12", async () => {
                const result = await exchangeClient.subAccountTransfer({
                    subAccountUser: TEST_SUB_ACCOUNT_ADDRESS,
                    isDeposit: true,
                    usd: 10,
                });

                assertJsonSchema(schema, result);
            });

            await t.step("usd === 123", async () => {
                const result = await exchangeClient.subAccountTransfer({
                    subAccountUser: TEST_SUB_ACCOUNT_ADDRESS,
                    isDeposit: true,
                    usd: 100,
                });

                assertJsonSchema(schema, result);
            });

            await t.step("usd === 1234", async () => {
                const result = await exchangeClient.subAccountTransfer({
                    subAccountUser: TEST_SUB_ACCOUNT_ADDRESS,
                    isDeposit: true,
                    usd: 1000,
                });

                assertJsonSchema(schema, result);
            });

            await t.step("usd === 12345", async () => {
                const result = await exchangeClient.subAccountTransfer({
                    subAccountUser: TEST_SUB_ACCOUNT_ADDRESS,
                    isDeposit: true,
                    usd: 10000,
                });

                assertJsonSchema(schema, result);
            });

            await t.step("usd === 123456", async () => {
                const result = await exchangeClient.subAccountTransfer({
                    subAccountUser: TEST_SUB_ACCOUNT_ADDRESS,
                    isDeposit: true,
                    usd: 100000,
                });

                assertJsonSchema(schema, result);
            });

            await t.step("usd === 1234567", async () => {
                const result = await exchangeClient.subAccountTransfer({
                    subAccountUser: TEST_SUB_ACCOUNT_ADDRESS,
                    isDeposit: true,
                    usd: 1000000,
                });

                assertJsonSchema(schema, result);
            });
        });

        await t.step("isDeposit === false", async (t) => {
            await t.step("usd === 1", async () => {
                const result = await exchangeClient.subAccountTransfer({
                    subAccountUser: TEST_SUB_ACCOUNT_ADDRESS,
                    isDeposit: false,
                    usd: 1,
                });

                assertJsonSchema(schema, result);
            });

            await t.step("usd === 12", async () => {
                const result = await exchangeClient.subAccountTransfer({
                    subAccountUser: TEST_SUB_ACCOUNT_ADDRESS,
                    isDeposit: false,
                    usd: 10,
                });

                assertJsonSchema(schema, result);
            });

            await t.step("usd === 123", async () => {
                const result = await exchangeClient.subAccountTransfer({
                    subAccountUser: TEST_SUB_ACCOUNT_ADDRESS,
                    isDeposit: false,
                    usd: 100,
                });

                assertJsonSchema(schema, result);
            });

            await t.step("usd === 1234", async () => {
                const result = await exchangeClient.subAccountTransfer({
                    subAccountUser: TEST_SUB_ACCOUNT_ADDRESS,
                    isDeposit: false,
                    usd: 1000,
                });

                assertJsonSchema(schema, result);
            });

            await t.step("usd === 12345", async () => {
                const result = await exchangeClient.subAccountTransfer({
                    subAccountUser: TEST_SUB_ACCOUNT_ADDRESS,
                    isDeposit: false,
                    usd: 10000,
                });

                assertJsonSchema(schema, result);
            });

            await t.step("usd === 123456", async () => {
                const result = await exchangeClient.subAccountTransfer({
                    subAccountUser: TEST_SUB_ACCOUNT_ADDRESS,
                    isDeposit: false,
                    usd: 100000,
                });

                assertJsonSchema(schema, result);
            });

            await t.step("usd === 1234567", async () => {
                const result = await exchangeClient.subAccountTransfer({
                    subAccountUser: TEST_SUB_ACCOUNT_ADDRESS,
                    isDeposit: false,
                    usd: 1000000,
                });

                assertJsonSchema(schema, result);
            });
        });
    },
);

function isHex(data: unknown): data is Hex {
    return typeof data === "string" && /^0x[0-9a-fA-F]+$/.test(data);
}
