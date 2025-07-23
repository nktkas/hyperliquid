import type { InfoClient, PerpsAssetCtx, PerpsUniverse } from "@nktkas/hyperliquid";
import BigNumber from "npm:bignumber.js@9";

/** Get asset data by name. */
export async function getAssetData(client: InfoClient, assetName: string): Promise<{
    id: number;
    universe: PerpsUniverse;
    ctx: PerpsAssetCtx;
}> {
    const data = await client.metaAndAssetCtxs();
    const id = data[0].universe.findIndex((u) => u.name === assetName);
    if (id === -1) throw new Error(`Asset "${assetName}" not found`);
    const universe = data[0].universe[id];
    const ctx = data[1][id];
    return { id, universe, ctx };
}

/** Generate a random Client Order ID. */
export function randomCloid(): `0x${string}` {
    return `0x${Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
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
        .toFixed(maxAllowedDecimals, roundingMode);
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
        .replace(/\.?0+$/, ""); // Remove trailing zeros
}

export function anyFnSuccess<T>(functions: (() => T)[]): T {
    const errors: Error[] = [];
    for (const fn of functions) {
        try {
            return fn();
        } catch (error) {
            errors.push(error instanceof Error ? error : new Error(String(error)));
        }
    }
    throw new AggregateError(errors, "All functions failed");
}
