import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.1";
import { ExchangeClient } from "../../index.ts";
import { assertJsonSchema, isHex } from "../utils.ts";

const TEST_PRIVATE_KEY = Deno.args[0];

if (!isHex(TEST_PRIVATE_KEY)) {
    throw new Error(`Expected a hex string, but got ${TEST_PRIVATE_KEY}`);
}

Deno.test(
    "usdClassTransfer",
    { permissions: { net: true, read: true } },
    async (t) => {
        // Create client
        const account = privateKeyToAccount(TEST_PRIVATE_KEY);
        const exchangeClient = new ExchangeClient(account, "https://api.hyperliquid-testnet.xyz/exchange", false);

        // Create TypeScript type schemas
        const tsjSchemaGenerator = tsj.createGenerator({ path: resolve("./src/types/exchange.d.ts"), skipTypeCheck: true });
        const schema = tsjSchemaGenerator.createSchema("SuccessResponse");

        // Test
        await t.step("toPerp === false", async () => {
            const result = await exchangeClient.usdClassTransfer({
                hyperliquidChain: "Testnet",
                signatureChainId: "0x66eee",
                amount: "1",
                toPerp: false,
                nonce: Date.now(),
            });

            assertJsonSchema(schema, result);
        });

        await t.step("toPerp === true", async () => {
            const result = await exchangeClient.usdClassTransfer({
                hyperliquidChain: "Testnet",
                signatureChainId: "0x66eee",
                amount: "1",
                toPerp: true,
                nonce: Date.now(),
            });

            assertJsonSchema(schema, result);
        });
    },
);
