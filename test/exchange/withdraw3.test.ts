import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.2";
import { assert } from "jsr:@std/assert@^1.0.4";
import { BigNumber } from "npm:bignumber.js@9.1.2";
import { ExchangeClient, type Hex, InfoClient } from "../../index.ts";
import { assertJsonSchema } from "../utils.ts";

const TEST_PRIVATE_KEY = Deno.args[0];

if (!isHex(TEST_PRIVATE_KEY)) {
    throw new Error(`Expected a hex string, but got ${TEST_PRIVATE_KEY}`);
}

Deno.test(
    "withdraw3",
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
            new BigNumber(balance.withdrawable).isGreaterThanOrEqualTo("14.713306"),
            `Expected a balance greater than or equal to 14.713306, but got ${balance.withdrawable}`,
        );

        // Test
        await t.step("amount === 2", async () => {
            const result = await exchangeClient.withdraw3({
                hyperliquidChain: "Testnet",
                signatureChainId: "0x66eee",
                amount: "2",
                time: Date.now(),
                destination: account.address,
            });

            assertJsonSchema(schema, result);
        });

        await t.step("amount === 2.1", async () => {
            const result = await exchangeClient.withdraw3({
                hyperliquidChain: "Testnet",
                signatureChainId: "0x66eee",
                amount: "2.1",
                time: Date.now(),
                destination: account.address,
            });

            assertJsonSchema(schema, result);
        });

        await t.step("amount === 2.12", async () => {
            const result = await exchangeClient.withdraw3({
                hyperliquidChain: "Testnet",
                signatureChainId: "0x66eee",
                amount: "2.12",
                time: Date.now(),
                destination: account.address,
            });

            assertJsonSchema(schema, result);
        });

        await t.step("amount === 2.123", async () => {
            const result = await exchangeClient.withdraw3({
                hyperliquidChain: "Testnet",
                signatureChainId: "0x66eee",
                amount: "2.123",
                time: Date.now(),
                destination: account.address,
            });

            assertJsonSchema(schema, result);
        });

        await t.step("amount === 2.1234", async () => {
            const result = await exchangeClient.withdraw3({
                hyperliquidChain: "Testnet",
                signatureChainId: "0x66eee",
                amount: "2.1234",
                time: Date.now(),
                destination: account.address,
            });

            assertJsonSchema(schema, result);
        });

        await t.step("amount === 2.12345", async () => {
            const result = await exchangeClient.withdraw3({
                hyperliquidChain: "Testnet",
                signatureChainId: "0x66eee",
                amount: "2.12345",
                time: Date.now(),
                destination: account.address,
            });

            assertJsonSchema(schema, result);
        });

        await t.step("amount === 2.123456", async () => {
            const result = await exchangeClient.withdraw3({
                hyperliquidChain: "Testnet",
                signatureChainId: "0x66eee",
                amount: "2.123456",
                time: Date.now(),
                destination: account.address,
            });

            assertJsonSchema(schema, result);
        });
    },
);

function isHex(data: unknown): data is Hex {
    return typeof data === "string" && /^0x[0-9a-fA-F]+$/.test(data);
}
