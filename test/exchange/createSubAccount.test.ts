import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.2";
import { ExchangeClient, type Hex } from "../../index.ts";
import { assertJsonSchema } from "../utils.ts";

const TEST_PRIVATE_KEY = Deno.args[0];

if (!isHex(TEST_PRIVATE_KEY)) {
    throw new Error(`Expected a hex string, but got ${TEST_PRIVATE_KEY}`);
}

// The test is ignored because: Only 10 sub-accounts can be created. And for a temporary wallet you need to somehow trade $100000 in volume
Deno.test.ignore(
    "createSubAccount",
    { permissions: { net: true, read: true } },
    async () => {
        // Create viem account
        const account = privateKeyToAccount(TEST_PRIVATE_KEY);

        // Create hyperliquid clients
        const exchangeClient = new ExchangeClient(account, "https://api.hyperliquid-testnet.xyz/exchange", false);

        // Create TypeScript type schemas
        const tsjSchemaGenerator = tsj.createGenerator({ path: resolve("./src/types/exchange.d.ts"), skipTypeCheck: true });
        const schema = tsjSchemaGenerator.createSchema("CreateSubAccountResponse");

        // Test
        const result = await exchangeClient.createSubAccount({
            name: String(Date.now()),
        });

        assertJsonSchema(schema, result);
    },
);

function isHex(data: unknown): data is Hex {
    return typeof data === "string" && /^0x[0-9a-fA-F]+$/.test(data);
}
