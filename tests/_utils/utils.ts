import type { Hex, InfoClient, PerpsAssetCtx, PerpsUniverse } from "@nktkas/hyperliquid";
import BigNumber from "npm:bignumber.js@9";
import { keccak_256 } from "@noble/hashes/sha3";

interface AssetData {
    id: number;
    universe: PerpsUniverse;
    ctx: PerpsAssetCtx;
}

/** Get asset data by name. */
export async function getAssetData(client: InfoClient, assetName: string): Promise<AssetData> {
    const data = await client.metaAndAssetCtxs();
    const id = data[0].universe.findIndex((u) => u.name === assetName);
    if (id === -1) throw new Error(`Asset "${assetName}" not found`);
    const universe = data[0].universe[id];
    const ctx = data[1][id];
    return { id, universe, ctx };
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
        .replace(/\.?0+$/, ""); // Remove trailing zeros
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
