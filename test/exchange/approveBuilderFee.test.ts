import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.2";
import { ExchangeClient, type Hex } from "../../index.ts";
import { assertJsonSchema } from "../utils.ts";

const TEST_PRIVATE_KEY = Deno.args[0];

if (!isHex(TEST_PRIVATE_KEY)) {
    throw new Error(`Expected a hex string, but got ${TEST_PRIVATE_KEY}`);
}

Deno.test(
    "approveBuilderFee",
    { permissions: { net: true, read: true } },
    async (t) => {
        // Create viem account
        const account = privateKeyToAccount(TEST_PRIVATE_KEY);

        // Create hyperliquid clients
        const exchangeClient = new ExchangeClient(account, "https://api.hyperliquid-testnet.xyz/exchange", false);

        // Create TypeScript type schemas
        const tsjSchemaGenerator = tsj.createGenerator({ path: resolve("./src/types/exchange.d.ts"), skipTypeCheck: true });
        const schema = tsjSchemaGenerator.createSchema("SuccessResponse");

        // Test
        await t.step("maxFeeRate === 0.001%", async () => {

        });

        await t.step("maxFeeRate === 0.01%", async () => {
            const result = await exchangeClient.approveBuilderFee({
                hyperliquidChain: "Testnet",
                signatureChainId: "0x66eee",
                maxFeeRate: "0.01%",
                builder: account.address,
                nonce: Date.now(),
            });

            assertJsonSchema(schema, result);
        });

        await t.step("maxFeeRate === 0.1%", async () => {
            const result = await exchangeClient.approveBuilderFee({
                hyperliquidChain: "Testnet",
                signatureChainId: "0x66eee",
                maxFeeRate: "0.1%",
                builder: account.address,
                nonce: Date.now(),
            });

            assertJsonSchema(schema, result);
        });

        await t.step("maxFeeRate === 1%", async () => {
            const result = await exchangeClient.approveBuilderFee({
                hyperliquidChain: "Testnet",
                signatureChainId: "0x66eee",
                maxFeeRate: "1%",
                builder: account.address,
                nonce: Date.now(),
            });

            assertJsonSchema(schema, result);
        });

        await t.step("maxFeeRate === 10%", async () => {
            const result = await exchangeClient.approveBuilderFee({
                hyperliquidChain: "Testnet",
                signatureChainId: "0x66eee",
                maxFeeRate: "10%",
                builder: account.address,
                nonce: Date.now(),
            });

            assertJsonSchema(schema, result);
        });

        await t.step("maxFeeRate === 100%", async () => {
            const result = await exchangeClient.approveBuilderFee({
                hyperliquidChain: "Testnet",
                signatureChainId: "0x66eee",
                maxFeeRate: "100%",
                builder: account.address,
                nonce: Date.now(),
            });

            assertJsonSchema(schema, result);
        });
    },
);

function isHex(data: unknown): data is Hex {
    return typeof data === "string" && /^0x[0-9a-fA-F]+$/.test(data);
}
