import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.2";
import { ExchangeClient } from "../../index.ts";
import { assertJsonSchema, isHex } from "../utils.ts";

const TEST_PRIVATE_KEY = Deno.args[0];
const TEST_SUB_ACCOUNT_ADDRESS = "0xcb3f0bd249a89e45e86a44bcfc7113e4ffe84cd1";

if (!isHex(TEST_PRIVATE_KEY)) {
    throw new Error(`Expected a hex string, but got ${TEST_PRIVATE_KEY}`);
}
if (!isHex(TEST_SUB_ACCOUNT_ADDRESS)) {
    throw new Error(`Expected a hex string, but got ${TEST_SUB_ACCOUNT_ADDRESS}`);
}

Deno.test(
    "subAccountTransfer",
    { permissions: { net: true, read: true } },
    async (t) => {
        // Create client
        const account = privateKeyToAccount(TEST_PRIVATE_KEY);
        const exchangeClient = new ExchangeClient(account, "https://api.hyperliquid-testnet.xyz/exchange", false);

        // Create TypeScript type schemas
        const tsjSchemaGenerator = tsj.createGenerator({ path: resolve("./src/types/exchange.d.ts"), skipTypeCheck: true });
        const schema = tsjSchemaGenerator.createSchema("SuccessResponse");

        // Test
        await t.step("isDeposit === true", async () => {
            const result = await exchangeClient.subAccountTransfer({
                subAccountUser: TEST_SUB_ACCOUNT_ADDRESS,
                isDeposit: true,
                usd: 1,
            });

            assertJsonSchema(schema, result);
        });

        await t.step("isDeposit === false", async () => {
            const result = await exchangeClient.subAccountTransfer({
                subAccountUser: TEST_SUB_ACCOUNT_ADDRESS,
                isDeposit: false,
                usd: 1,
            });

            assertJsonSchema(schema, result);
        });
    },
);
