import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.2";
import { ExchangeClient } from "../../index.ts";
import { assertJsonSchema, generateEthereumAddress, isHex } from "../utils.ts";

const TEST_PRIVATE_KEY = Deno.args[0];

if (!isHex(TEST_PRIVATE_KEY)) {
    throw new Error(`Expected a hex string, but got ${TEST_PRIVATE_KEY}`);
}

Deno.test(
    "spotSend",
    { permissions: { net: true, read: true } },
    async () => {
        // Create client
        const account = privateKeyToAccount(TEST_PRIVATE_KEY);
        const exchangeClient = new ExchangeClient(account, "https://api.hyperliquid-testnet.xyz/exchange", false);

        // Create TypeScript type schemas
        const tsjSchemaGenerator = tsj.createGenerator({ path: resolve("./src/types/exchange.d.ts"), skipTypeCheck: true });
        const schema = tsjSchemaGenerator.createSchema("SuccessResponse");

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
    },
);
