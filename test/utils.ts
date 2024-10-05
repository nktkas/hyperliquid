import { Ajv } from "npm:ajv@^8.17.1";
import type { Definition } from "npm:ts-json-schema-generator@^2.3.0";
import { assert } from "jsr:@std/assert@^1.0.4";
import type { AssetCtx, InfoClient, Universe } from "../index.ts";

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
    // deno-lint-ignore no-explicit-any
    obj: Record<PropertyKey, any> | any[],
    // deno-lint-ignore no-explicit-any
    func: (key: string | number, value: any) => void,
): void {
    if (typeof obj === "object" && obj !== null) {
        for (const [key, value] of Object.entries(obj)) {
            func(key, value);
            if (typeof value === "object" && value !== null) {
                recursiveTraversal(value, func);
            }
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
