import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.1";
import { BigNumber } from "npm:bignumber.js@9.1.1";
import { assert } from "jsr:@std/assert@^1.0.4";
import { ExchangeClient, type Hex, InfoClient } from "../../index.ts";
import { assertJsonSchema } from "../utils.ts";

const TEST_PRIVATE_KEY = Deno.args[0];

if (!isHex(TEST_PRIVATE_KEY)) {
    throw new Error(`Expected a hex string, but got ${TEST_PRIVATE_KEY}`);
}

Deno.test(
    "usdClassTransfer",
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
            new BigNumber(balance.withdrawable).isGreaterThanOrEqualTo("7.713306"),
            `Expected a balance greater than or equal to 7.713306, but got ${balance.withdrawable}`,
        );

        // Test
        await t.step("toPerp === false", async (t) => {
            await t.step("amount === 1", async () => {
                const result = await exchangeClient.usdClassTransfer({
                    hyperliquidChain: "Testnet",
                    signatureChainId: "0x66eee",
                    amount: "1",
                    toPerp: false,
                    nonce: Date.now(),
                });

                assertJsonSchema(schema, result);
            });

            await t.step("amount === 1.1", async () => {
                const result = await exchangeClient.usdClassTransfer({
                    hyperliquidChain: "Testnet",
                    signatureChainId: "0x66eee",
                    amount: "1.1",
                    toPerp: false,
                    nonce: Date.now(),
                });

                assertJsonSchema(schema, result);
            });

            await t.step("amount === 1.12", async () => {
                const result = await exchangeClient.usdClassTransfer({
                    hyperliquidChain: "Testnet",
                    signatureChainId: "0x66eee",
                    amount: "1.12",
                    toPerp: false,
                    nonce: Date.now(),
                });

                assertJsonSchema(schema, result);
            });

            await t.step("amount === 1.123", async () => {
                const result = await exchangeClient.usdClassTransfer({
                    hyperliquidChain: "Testnet",
                    signatureChainId: "0x66eee",
                    amount: "1.123",
                    toPerp: false,
                    nonce: Date.now(),
                });

                assertJsonSchema(schema, result);
            });

            await t.step("amount === 1.1234", async () => {
                const result = await exchangeClient.usdClassTransfer({
                    hyperliquidChain: "Testnet",
                    signatureChainId: "0x66eee",
                    amount: "1.1234",
                    toPerp: false,
                    nonce: Date.now(),
                });

                assertJsonSchema(schema, result);
            });

            await t.step("amount === 1.12345", async () => {
                const result = await exchangeClient.usdClassTransfer({
                    hyperliquidChain: "Testnet",
                    signatureChainId: "0x66eee",
                    amount: "1.12345",
                    toPerp: false,
                    nonce: Date.now(),
                });

                assertJsonSchema(schema, result);
            });

            await t.step("amount === 1.123456", async () => {
                const result = await exchangeClient.usdClassTransfer({
                    hyperliquidChain: "Testnet",
                    signatureChainId: "0x66eee",
                    amount: "1.123456",
                    toPerp: false,
                    nonce: Date.now(),
                });

                assertJsonSchema(schema, result);
            });
        });

        await t.step("toPerp === true", async (t) => {
            await t.step("amount === 1", async () => {
                const result = await exchangeClient.usdClassTransfer({
                    hyperliquidChain: "Testnet",
                    signatureChainId: "0x66eee",
                    amount: "1",
                    toPerp: true,
                    nonce: Date.now(),
                });

                assertJsonSchema(schema, result);
            });

            await t.step("amount === 1.1", async () => {
                const result = await exchangeClient.usdClassTransfer({
                    hyperliquidChain: "Testnet",
                    signatureChainId: "0x66eee",
                    amount: "1.1",
                    toPerp: true,
                    nonce: Date.now(),
                });

                assertJsonSchema(schema, result);
            });

            await t.step("amount === 1.12", async () => {
                const result = await exchangeClient.usdClassTransfer({
                    hyperliquidChain: "Testnet",
                    signatureChainId: "0x66eee",
                    amount: "1.12",
                    toPerp: true,
                    nonce: Date.now(),
                });

                assertJsonSchema(schema, result);
            });

            await t.step("amount === 1.123", async () => {
                const result = await exchangeClient.usdClassTransfer({
                    hyperliquidChain: "Testnet",
                    signatureChainId: "0x66eee",
                    amount: "1.123",
                    toPerp: true,
                    nonce: Date.now(),
                });

                assertJsonSchema(schema, result);
            });

            await t.step("amount === 1.1234", async () => {
                const result = await exchangeClient.usdClassTransfer({
                    hyperliquidChain: "Testnet",
                    signatureChainId: "0x66eee",
                    amount: "1.1234",
                    toPerp: true,
                    nonce: Date.now(),
                });

                assertJsonSchema(schema, result);
            });

            await t.step("amount === 1.12345", async () => {
                const result = await exchangeClient.usdClassTransfer({
                    hyperliquidChain: "Testnet",
                    signatureChainId: "0x66eee",
                    amount: "1.12345",
                    toPerp: true,
                    nonce: Date.now(),
                });

                assertJsonSchema(schema, result);
            });

            await t.step("amount === 1.123456", async () => {
                const result = await exchangeClient.usdClassTransfer({
                    hyperliquidChain: "Testnet",
                    signatureChainId: "0x66eee",
                    amount: "1.123456",
                    toPerp: true,
                    nonce: Date.now(),
                });

                assertJsonSchema(schema, result);
            });
        });
    },
);

function isHex(data: unknown): data is Hex {
    return typeof data === "string" && /^0x[0-9a-fA-F]+$/.test(data);
}
