import type { AssetCtx, Hex, PublicClient, Universe } from "../index.ts";
import { Ajv } from "npm:ajv@^8.17.1";
import type { Definition } from "npm:ts-json-schema-generator@^2.3.0";
import { assert, assertGreater } from "jsr:@std/assert@^1.0.4";
import { keccak_256 } from "@noble/hashes/sha3";

export interface AssetData {
    id: number;
    universe: Universe;
    ctx: AssetCtx;
}

/**
 * Asserts that the data matches the JSON schema
 * @param schema - A JSON schema definition
 * @param data - Data to validate
 */
export function assertJsonSchema<T>(schema: Definition, data: unknown): asserts data is T {
    const ajv = new Ajv({ strict: true });
    const validate = ajv.compile(schema);
    assert(validate(data), JSON.stringify(validate.errors) + "\n" + JSON.stringify(data));
}

/**
 * Asserts that the data includes a non-empty array
 * @param data - Data to validate
 */
export function assertIncludesNotEmptyArray(data: object): void {
    recursiveTraversal(data, "", (fullPath, value) => {
        if (Array.isArray(value)) {
            assertGreater(
                value.length,
                0,
                `Unable to fully validate the type due to an empty array. Path: ${fullPath}, Data: ${
                    JSON.stringify(data, null, 2)
                }`,
            );
        }
    });
}

/**
 * Recursively traverse an object
 * @param obj - Object to traverse
 * @param parentPath - Accumulated path
 * @param fn - Callback function
 */
function recursiveTraversal(
    obj: object,
    parentPath: string,
    fn: (fullPath: string, value: unknown) => void,
): void {
    for (const [key, value] of Object.entries(obj)) {
        const currentPath = parentPath ? `${parentPath}.${key}` : key;
        fn(currentPath, value);

        if (typeof value === "object" && value !== null) {
            recursiveTraversal(value, currentPath, fn);
        }
    }
}

/**
 * Get asset data by asset name
 * @param client - Hyperliquid info client
 * @param assetName - Asset name
 * @returns Asset data
 */
export async function getAssetData(client: PublicClient, assetName: string): Promise<AssetData> {
    const data = await client.metaAndAssetCtxs();
    const id = data[0].universe.findIndex((u) => u.name === assetName)!;
    const universe = data[0].universe[id];
    const ctx = data[1][id];
    return { id, universe, ctx };
}

/**
 * Verify if the data is a hex string
 * @param data - Data to verify
 * @returns `true` if the data is a hex string
 */
export function isHex(data: unknown): data is Hex {
    return typeof data === "string" && /^0x[0-9a-fA-F]+$/.test(data);
}

/**
 * Generate a random Client Order ID
 * @returns Client Order ID
 */
export function randomCloid(): Hex {
    return `0x${Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
}

/**
 * Generate an Ethereum address
 * @returns Ethereum address
 */
export function generateEthereumAddress(): Hex {
    // Step 1: Generate a random 20-byte hex string
    const address = Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

    // Step 2: Generate the checksum
    const hashBytes = keccak_256(address.toLowerCase());
    const hashHex = Array.from(hashBytes).map((byte) => byte.toString(16).padStart(2, "0")).join("");

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
