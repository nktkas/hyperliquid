import type { AssetCtx, Hex, InfoClient, Universe } from "../index.ts";
import { Ajv } from "npm:ajv@^8.17.1";
import type { Definition } from "npm:ts-json-schema-generator@^2.3.0";
import { assert } from "jsr:@std/assert@^1.0.4";
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
export function assertJsonSchema(schema: Definition, data: unknown): void {
    const ajv = new Ajv({ strict: true });
    const validate = ajv.compile(schema);
    assert(validate(data), JSON.stringify(validate.errors) + "\n" + JSON.stringify(data));
}

/**
 * Recursively traverse an object
 * @param obj - Object to traverse
 * @param func - Callback function
 */
export function recursiveTraversal(
    obj: object,
    func: (key: string | number, value: unknown) => void,
): void {
    for (const [key, value] of Object.entries(obj)) {
        func(key, value);
        if (typeof value === "object" && value !== null) {
            recursiveTraversal(value, func);
        }
    }
}

/**
 * Get asset data by asset name
 * @param client - Hyperliquid info client
 * @param assetName - Asset name
 * @returns Asset data
 */
export async function getAssetData(client: InfoClient, assetName: string): Promise<AssetData> {
    const data = await client.metaAndAssetCtxs();
    const id = data[0].universe.findIndex((u) => u.name === assetName)!;
    const universe = data[0].universe[id];
    const ctx = data[1][id];
    return { id, universe, ctx };
}

/**
 * Get the number of decimals for the price
 * @param marketType - Market type
 * @param szDecimals - Number of decimals for the size
 * @returns Number of decimals for the price
 */
export function getPxDecimals(marketType: "perp" | "spot", szDecimals: number): number {
    const MAX_DECIMALS = marketType === "perp" ? 5 : 7;
    const maxPxDecimals = MAX_DECIMALS - szDecimals;
    return Math.max(0, maxPxDecimals);
}

/**
 * Generate an Ethereum address
 * @returns Ethereum address
 */
export function generateEthereumAddress(): Hex {
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
