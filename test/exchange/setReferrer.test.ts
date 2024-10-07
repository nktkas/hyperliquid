import { generatePrivateKey, privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.2";
import { ExchangeClient } from "../../index.ts";
import { assertJsonSchema, isHex } from "../utils.ts";

const TEST_PRIVATE_KEY = Deno.args[0];

if (!isHex(TEST_PRIVATE_KEY)) {
    throw new Error(`Expected a hex string, but got ${TEST_PRIVATE_KEY}`);
}

Deno.test(
    "setReferrer",
    { permissions: { net: true, read: true } },
    async () => {
        // Create client
        const account = privateKeyToAccount(TEST_PRIVATE_KEY);
        const exchangeClient = new ExchangeClient(account, "https://api.hyperliquid-testnet.xyz/exchange", false);

        // Create TypeScript type schemas
        const tsjSchemaGenerator = tsj.createGenerator({ path: resolve("./src/types/exchange.d.ts"), skipTypeCheck: true });
        const schema = tsjSchemaGenerator.createSchema("SuccessResponse");

        // Preparing a temporary wallet
        const tempPrivKey = generatePrivateKey();
        const tempAccount = privateKeyToAccount(tempPrivKey);
        const tempExchangeClient = new ExchangeClient(
            tempAccount,
            "https://api.hyperliquid-testnet.xyz/exchange",
            false,
        );

        await exchangeClient.usdSend({
            hyperliquidChain: "Testnet",
            signatureChainId: "0x66eee",
            destination: tempAccount.address,
            amount: "2",
            time: Date.now(),
        });

        // Test
        const result = await tempExchangeClient.setReferrer({ code: "TEST" });

        assertJsonSchema(schema, result);
    },
);
