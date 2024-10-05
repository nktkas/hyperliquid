import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.2";
import { assert } from "jsr:@std/assert@^1.0.4";
import { BigNumber } from "npm:bignumber.js@9.1.2";
import { ExchangeClient, type Hex, InfoClient } from "../../index.ts";
import { assertJsonSchema } from "../utils.ts";

const TEST_PRIVATE_KEY = Deno.args[0];
const TEST_VAULT_ADDRESS = Deno.args[2];

if (!isHex(TEST_PRIVATE_KEY)) {
    throw new Error(`Expected a hex string, but got ${TEST_PRIVATE_KEY}`);
}
if (!isHex(TEST_VAULT_ADDRESS)) {
    throw new Error(`Expected a hex string, but got ${TEST_VAULT_ADDRESS}`);
}

Deno.test(
    "vaultTransfer",
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
            new BigNumber(balance.withdrawable).isGreaterThanOrEqualTo("35.713306"),
            `Expected a balance greater than or equal to 35.713306, but got ${balance.withdrawable}`,
        );

        // Test
        await t.step("isDeposit === false", async (t) => {
            await t.step("usd === 5000000", async () => {
                const result = await exchangeClient.vaultTransfer({
                    vaultAddress: TEST_VAULT_ADDRESS,
                    isDeposit: false,
                    usd: 5000000,
                });

                assertJsonSchema(schema, result);
            });

            await t.step("usd === 5100000", async () => {
                const result = await exchangeClient.vaultTransfer({
                    vaultAddress: TEST_VAULT_ADDRESS,
                    isDeposit: false,
                    usd: 5100000,
                });

                assertJsonSchema(schema, result);
            });

            await t.step("usd === 5120000", async () => {
                const result = await exchangeClient.vaultTransfer({
                    vaultAddress: TEST_VAULT_ADDRESS,
                    isDeposit: false,
                    usd: 5120000,
                });

                assertJsonSchema(schema, result);
            });

            await t.step("usd === 5123000", async () => {
                const result = await exchangeClient.vaultTransfer({
                    vaultAddress: TEST_VAULT_ADDRESS,
                    isDeposit: false,
                    usd: 5123000,
                });

                assertJsonSchema(schema, result);
            });

            await t.step("usd === 5123400", async () => {
                const result = await exchangeClient.vaultTransfer({
                    vaultAddress: TEST_VAULT_ADDRESS,
                    isDeposit: false,
                    usd: 5123400,
                });

                assertJsonSchema(schema, result);
            });

            await t.step("usd === 5123450", async () => {
                const result = await exchangeClient.vaultTransfer({
                    vaultAddress: TEST_VAULT_ADDRESS,
                    isDeposit: false,
                    usd: 5123450,
                });

                assertJsonSchema(schema, result);
            });

            await t.step("usd === 5123456", async () => {
                const result = await exchangeClient.vaultTransfer({
                    vaultAddress: TEST_VAULT_ADDRESS,
                    isDeposit: false,
                    usd: 5123456,
                });

                assertJsonSchema(schema, result);
            });
        });

        await t.step("isDeposit === true", async (t) => {
            await t.step("usd === 5000000", async () => {
                const result = await exchangeClient.vaultTransfer({
                    vaultAddress: TEST_VAULT_ADDRESS,
                    isDeposit: true,
                    usd: 5000000,
                });

                assertJsonSchema(schema, result);
            });

            await t.step("usd === 5100000", async () => {
                const result = await exchangeClient.vaultTransfer({
                    vaultAddress: TEST_VAULT_ADDRESS,
                    isDeposit: true,
                    usd: 5100000,
                });

                assertJsonSchema(schema, result);
            });

            await t.step("usd === 5120000", async () => {
                const result = await exchangeClient.vaultTransfer({
                    vaultAddress: TEST_VAULT_ADDRESS,
                    isDeposit: true,
                    usd: 5120000,
                });

                assertJsonSchema(schema, result);
            });

            await t.step("usd === 5123000", async () => {
                const result = await exchangeClient.vaultTransfer({
                    vaultAddress: TEST_VAULT_ADDRESS,
                    isDeposit: true,
                    usd: 5123000,
                });

                assertJsonSchema(schema, result);
            });

            await t.step("usd === 5123400", async () => {
                const result = await exchangeClient.vaultTransfer({
                    vaultAddress: TEST_VAULT_ADDRESS,
                    isDeposit: true,
                    usd: 5123400,
                });

                assertJsonSchema(schema, result);
            });

            await t.step("usd === 5123450", async () => {
                const result = await exchangeClient.vaultTransfer({
                    vaultAddress: TEST_VAULT_ADDRESS,
                    isDeposit: true,
                    usd: 5123450,
                });

                assertJsonSchema(schema, result);
            });

            await t.step("usd === 5123456", async () => {
                const result = await exchangeClient.vaultTransfer({
                    vaultAddress: TEST_VAULT_ADDRESS,
                    isDeposit: true,
                    usd: 5123456,
                });

                assertJsonSchema(schema, result);
            });
        });
    },
);

function isHex(data: unknown): data is Hex {
    return typeof data === "string" && /^0x[0-9a-fA-F]+$/.test(data);
}
