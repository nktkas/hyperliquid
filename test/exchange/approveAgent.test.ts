import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.2";
import { keccak_256 } from "npm:@noble/hashes@^1.5.0/sha3";
import { ExchangeClient, type Hex } from "../../index.ts";
import { assertJsonSchema } from "../utils.ts";

const TEST_PRIVATE_KEY = Deno.args[0];

if (!isHex(TEST_PRIVATE_KEY)) {
    throw new Error(`Expected a hex string, but got ${TEST_PRIVATE_KEY}`);
}

Deno.test(
    "approveAgent",
    { permissions: { net: true, read: true } },
    async () => {
        // Create viem account
        const account = privateKeyToAccount(TEST_PRIVATE_KEY);

        // Create hyperliquid clients
        const exchangeClient = new ExchangeClient(account, "https://api.hyperliquid-testnet.xyz/exchange", false);

        // Create TypeScript type schemas
        const tsjSchemaGenerator = tsj.createGenerator({ path: resolve("./src/types/exchange.d.ts"), skipTypeCheck: true });
        const schema = tsjSchemaGenerator.createSchema("SuccessResponse");

        // Test
        const result = await exchangeClient.approveAgent({
            hyperliquidChain: "Testnet",
            signatureChainId: "0x66eee",
            agentAddress: generateEthereumAddress(),
            agentName: "agentName",
            nonce: Date.now(),
        });

        assertJsonSchema(schema, result);
    },
);

function isHex(data: unknown): data is Hex {
    return typeof data === "string" && /^0x[0-9a-fA-F]+$/.test(data);
}

function generateEthereumAddress(): Hex {
    // Step 1: Generate a random 20-byte hex string

    const randomBytes = new Uint8Array(20);
    crypto.getRandomValues(randomBytes);

    const address = Array.from(randomBytes)
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");

    // Step 2: Generate the checksum

    const hashBytes = keccak_256(address.toLowerCase());

    const hashHex = Array.from(hashBytes)
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");

    // Step 3: Apply the checksum

    let checksumAddress = "";
    for (let i = 0; i < address.length; i++) {
        const char = address[i];
        const hashChar = hashHex[i];
        if (parseInt(hashChar, 16) >= 8) {
            checksumAddress += char.toUpperCase();
        } else {
            checksumAddress += char.toLowerCase();
        }
    }

    return `0x${checksumAddress}`;
}
