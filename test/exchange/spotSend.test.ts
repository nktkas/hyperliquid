import { generatePrivateKey, privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.2";
import { BigNumber } from "npm:bignumber.js@9.1.2";
import { assert } from "jsr:@std/assert@^1.0.4";
import { ExchangeClient, type Hex, InfoClient } from "../../index.ts";
import { assertJsonSchema } from "../utils.ts";

const TEST_PRIVATE_KEY = Deno.args[0];

if (!isHex(TEST_PRIVATE_KEY)) {
    throw new Error(`Expected a hex string, but got ${TEST_PRIVATE_KEY}`);
}

Deno.test(
    "spotSend",
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
            new BigNumber(balance.withdrawable).isGreaterThanOrEqualTo("9.96021948"),
            `Expected a balance greater than or equal to 9.96021948, but got ${balance.withdrawable}`,
        );

        // Preparation of balance
        await exchangeClient.usdClassTransfer({
            hyperliquidChain: "Testnet",
            signatureChainId: "0x66eee",
            amount: "9.96021948",
            toPerp: false,
            nonce: Date.now(),
        });

        // Preparing a temporary wallet
        const tempPrivKey = generatePrivateKey();
        const tempAccount = privateKeyToAccount(tempPrivKey);
        const tempExchangeClient = new ExchangeClient(
            tempAccount,
            "https://api.hyperliquid-testnet.xyz/exchange",
            false,
        );
        console.log(`Test private key ${tempPrivKey}`);

        // Test
        await t.step("amount === 1", async () => {
            const result = await exchangeClient.spotSend({
                hyperliquidChain: "Testnet",
                signatureChainId: "0x66eee",
                destination: tempAccount.address,
                token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
                amount: "1",
                time: Date.now(),
            });

            assertJsonSchema(schema, result);
        });

        await t.step("amount === 1.1", async () => {
            const result = await exchangeClient.spotSend({
                hyperliquidChain: "Testnet",
                signatureChainId: "0x66eee",
                destination: tempAccount.address,
                token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
                amount: "1.1",
                time: Date.now(),
            });

            assertJsonSchema(schema, result);
        });

        await t.step("amount === 1.12", async () => {
            const result = await exchangeClient.spotSend({
                hyperliquidChain: "Testnet",
                signatureChainId: "0x66eee",
                destination: tempAccount.address,
                token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
                amount: "1.12",
                time: Date.now(),
            });

            assertJsonSchema(schema, result);
        });

        await t.step("amount === 1.123", async () => {
            const result = await exchangeClient.spotSend({
                hyperliquidChain: "Testnet",
                signatureChainId: "0x66eee",
                destination: tempAccount.address,
                token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
                amount: "1.123",
                time: Date.now(),
            });

            assertJsonSchema(schema, result);
        });

        await t.step("amount === 1.1234", async () => {
            const result = await exchangeClient.spotSend({
                hyperliquidChain: "Testnet",
                signatureChainId: "0x66eee",
                destination: tempAccount.address,
                token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
                amount: "1.1234",
                time: Date.now(),
            });

            assertJsonSchema(schema, result);
        });

        await t.step("amount === 1.12345", async () => {
            const result = await exchangeClient.spotSend({
                hyperliquidChain: "Testnet",
                signatureChainId: "0x66eee",
                destination: tempAccount.address,
                token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
                amount: "1.12345",
                time: Date.now(),
            });

            assertJsonSchema(schema, result);
        });

        await t.step("amount === 1.123456", async () => {
            const result = await exchangeClient.spotSend({
                hyperliquidChain: "Testnet",
                signatureChainId: "0x66eee",
                destination: tempAccount.address,
                token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
                amount: "1.123456",
                time: Date.now(),
            });

            assertJsonSchema(schema, result);
        });

        await t.step("amount === 1.1234567", async () => {
            const result = await exchangeClient.spotSend({
                hyperliquidChain: "Testnet",
                signatureChainId: "0x66eee",
                destination: tempAccount.address,
                token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
                amount: "1.1234567",
                time: Date.now(),
            });

            assertJsonSchema(schema, result);
        });

        await t.step("amount === 1.12345678", async () => {
            const result = await exchangeClient.spotSend({
                hyperliquidChain: "Testnet",
                signatureChainId: "0x66eee",
                destination: tempAccount.address,
                token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
                amount: "1.12345678",
                time: Date.now(),
            });

            assertJsonSchema(schema, result);
        });

        //Post test cleaning
        await tempExchangeClient.spotSend({
            hyperliquidChain: "Testnet",
            signatureChainId: "0x66eee",
            destination: account.address,
            token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
            amount: "9.96021948",
            time: Date.now(),
        });

        await exchangeClient.usdClassTransfer({
            hyperliquidChain: "Testnet",
            signatureChainId: "0x66eee",
            amount: "9.96021948",
            toPerp: true,
            nonce: Date.now(),
        });
    },
);

function isHex(data: unknown): data is Hex {
    return typeof data === "string" && /^0x[0-9a-fA-F]+$/.test(data);
}
