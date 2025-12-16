/**
 * Utility helpers for working with Hyperliquid.
 *
 * This module re-exports utilities for:
 * - Formatting prices and sizes according to Hyperliquid's {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/tick-and-lot-size | tick and lot size rules} ({@link formatPrice}, {@link formatSize}).
 * - Converting human-readable asset symbols to Hyperliquid asset IDs ({@link SymbolConverter}).
 *
 * @example Formatting values for an order
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { formatPrice, formatSize, SymbolConverter } from "@nktkas/hyperliquid/utils";
 *
 * const transport = new HttpTransport();
 * const converter = await SymbolConverter.create({ transport });
 *
 * const symbol = "BTC";
 * const szDecimals = converter.getSzDecimals(symbol) ?? 0;
 *
 * const price = formatPrice("97123.456789", szDecimals); // → "97123"
 * const size = formatSize("0.00123456789", szDecimals); // → "0.00123"
 * ```
 *
 * @module
 */

export * from "./_symbolConverter.ts";
export * from "./_format.ts";
