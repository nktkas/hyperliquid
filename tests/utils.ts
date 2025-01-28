import type { Hex, PerpsAssetCtx, PerpsUniverse, PublicClient } from "../mod.ts";
import { Ajv } from "npm:ajv@^8.17.1";
import { assert } from "jsr:@std/assert@^1.0.4";
import { BigNumber } from "npm:bignumber.js@^9.1.2";
import type { JSONSchema7, JSONSchema7Definition } from "npm:json-schema@0.4.0";
import { keccak_256 } from "@noble/hashes/sha3";

/**
 * Asserts that the data matches the JSON schema
 * @param schema - A JSON schema definition
 * @param data - A data to validate
 * @param options - Additional options
 */
export function assertJsonSchema(
    schema: JSONSchema7,
    data: unknown,
    options?: {
        skipMinItemsCheck?: string[] | boolean;
    },
): asserts data {
    const strictSchema = addMinItemsToArrays(schema, 1, options?.skipMinItemsCheck);
    const ajv = new Ajv({ strict: true });
    assert(
        ajv.validate(strictSchema, data),
        `\nSchema error: ${JSON.stringify(ajv.errors)}\nData: ${JSON.stringify(data)}`,
    );
}

/**
 * Get asset data by asset name
 * @param client - Hyperliquid info client
 * @param assetName - Asset name
 * @returns Asset data
 */
export async function getAssetData(client: PublicClient, assetName: string): Promise<{
    id: number;
    universe: PerpsUniverse;
    ctx: PerpsAssetCtx;
}> {
    const data = await client.metaAndAssetCtxs();
    const id = data[0].universe.findIndex((u) => u.name === assetName)!;
    const universe = data[0].universe[id];
    const ctx = data[1][id];
    return { id, universe, ctx };
}

/** Check if the data is a hex string. */
export function isHex(data: unknown): data is Hex {
    return typeof data === "string" && /^0x[0-9a-fA-F]+$/.test(data);
}

/** Generate a random Client Order ID. */
export function randomCloid(): Hex {
    return `0x${Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
}

/** Generate an Ethereum address. */
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

/**
 * Format the price for Hyperliquid
 * @param price - Price value
 * @param szDecimals - Size decimals from `universe`
 * @param isPerp - Is perpetual market? Default: `true`
 * @param roundingMode - BigNumber rounding mode. Default: `ROUND_HALF_UP`
 * @returns Formatted price
 */
export function formatPrice(
    price: BigNumber.Value,
    szDecimals: number,
    isPerp: boolean = true,
    roundingMode: BigNumber.RoundingMode = BigNumber.ROUND_HALF_UP,
): string {
    const priceBN = new BigNumber(price);
    if (priceBN.isInteger()) return priceBN.toString();

    const maxDecimals = isPerp ? 6 : 8;
    const maxAllowedDecimals = Math.max(maxDecimals - szDecimals, 0);

    return priceBN
        .precision(5, roundingMode)
        .toFixed(maxAllowedDecimals, roundingMode)
        .replace(/\.?0+$/, "");
}

/**
 * Format the size for Hyperliquid
 * @param size - Size value
 * @param szDecimals - Size decimals from `universe`
 * @param roundingMode - BigNumber rounding mode. Default: `ROUND_HALF_UP`
 * @returns Formatted size
 */
export function formatSize(
    size: BigNumber.Value,
    szDecimals: number,
    roundingMode: BigNumber.RoundingMode = BigNumber.ROUND_HALF_UP,
): string {
    return new BigNumber(size)
        .toFixed(szDecimals, roundingMode)
        .replace(/\.?0+$/, "");
}

/** Add `minItems` to all arrays in the json schema. */
export function addMinItemsToArrays<T extends JSONSchema7 | JSONSchema7Definition>(
    schema: T,
    minItemsValue: number = 1,
    skipKeys: string[] | boolean = [],
): T {
    if (!schema || typeof schema !== "object") {
        return schema;
    }

    const copy = structuredClone(schema);

    if (copy.definitions) {
        const newDefinitions: Record<string, JSONSchema7> = {};
        for (const [key, defSchema] of Object.entries(copy.definitions)) {
            newDefinitions[key] = typeof skipKeys === "boolean"
                ? skipKeys
                : skipKeys.includes(key)
                ? defSchema
                : addMinItemsToArrays(defSchema, minItemsValue, skipKeys);
        }
        copy.definitions = newDefinitions;
    }

    if (copy.type === "array") {
        if (copy.minItems === undefined) {
            copy.minItems = minItemsValue;
        }
        if (copy.items) {
            copy.items = addMinItemsToArrays(copy.items, minItemsValue, skipKeys);
        }
    }

    if (copy.anyOf) {
        copy.anyOf = copy.anyOf.map((subSchema: JSONSchema7) =>
            addMinItemsToArrays(subSchema, minItemsValue, skipKeys)
        );
    }
    if (copy.allOf) {
        copy.allOf = copy.allOf.map((subSchema: JSONSchema7) =>
            addMinItemsToArrays(subSchema, minItemsValue, skipKeys)
        );
    }
    if (copy.oneOf) {
        copy.oneOf = copy.oneOf.map((subSchema: JSONSchema7) =>
            addMinItemsToArrays(subSchema, minItemsValue, skipKeys)
        );
    }

    if (copy.type === "object" && copy.properties) {
        const newProperties: Record<string, JSONSchema7> = {};
        for (const [key, propSchema] of Object.entries(copy.properties)) {
            newProperties[key] = typeof skipKeys === "boolean"
                ? skipKeys
                : skipKeys.includes(key)
                ? propSchema
                : addMinItemsToArrays(propSchema, minItemsValue, skipKeys);
        }
        copy.properties = newProperties;
    }

    return copy as T;
}
