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
    "setReferrer",
    { permissions: { net: true, read: true } },
    async () => {
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
            new BigNumber(balance.withdrawable).isGreaterThanOrEqualTo("2"),
            `Expected a balance greater than or equal to 2 but got ${balance.withdrawable}`,
        );

        // Preparing a temporary wallet
        const tempPrivKey = generatePrivateKey();
        const tempAccount = privateKeyToAccount(tempPrivKey);
        const tempExchangeClient = new ExchangeClient(
            tempAccount,
            "https://api.hyperliquid-testnet.xyz/exchange",
            false,
        );
        console.log(`Test private key ${tempPrivKey}`);

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

function isHex(data: unknown): data is Hex {
    return typeof data === "string" && /^0x[0-9a-fA-F]+$/.test(data);
}
