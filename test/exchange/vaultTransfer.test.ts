import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.2";
import { ExchangeClient } from "../../index.ts";
import { assertJsonSchema, isHex } from "../utils.ts";

const TEST_PRIVATE_KEY = Deno.args[0];
const TEST_VAULT_ADDRESS = "0x1719884eb866cb12b2287399b15f7db5e7d775ea";

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
        // Create client
        const account = privateKeyToAccount(TEST_PRIVATE_KEY);
        const exchangeClient = new ExchangeClient(account, "https://api.hyperliquid-testnet.xyz/exchange", false);

        // Create TypeScript type schemas
        const tsjSchemaGenerator = tsj.createGenerator({ path: resolve("./src/types/exchange.d.ts"), skipTypeCheck: true });
        const schema = tsjSchemaGenerator.createSchema("SuccessResponse");

        // Test
        await t.step("isDeposit === false", async () => {
            const result = await exchangeClient.vaultTransfer({
                vaultAddress: TEST_VAULT_ADDRESS,
                isDeposit: false,
                usd: 5000000, // 5 USD minimum
            });

            assertJsonSchema(schema, result);
        });

        await t.step("isDeposit === true", async () => {
            const result = await exchangeClient.vaultTransfer({
                vaultAddress: TEST_VAULT_ADDRESS,
                isDeposit: true,
                usd: 5000000, // 5 USD minimum
            });

            assertJsonSchema(schema, result);
        });
    },
);
