/**
 * Price and size formatting per Hyperliquid tick and lot size rules.
 *
 * @module
 */

import { Decimal } from "decimal.js";
import { HyperliquidError } from "../_base.ts";

/**
 * Thrown when a price or size value cannot be formatted to a valid decimal.
 *
 * @example
 * ```ts
 * import { formatPrice, FormatError } from "@nktkas/hyperliquid/utils";
 *
 * try {
 *   formatPrice("not a number", 0);
 * } catch (error) {
 *   if (error instanceof FormatError) {
 *     console.error(error.message);
 *   }
 * }
 * ```
 */
export class FormatError extends HyperliquidError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "FormatError";
  }
}

// A cloned constructor isolates our rounding mode from the global decimal.js
// config, which any other consumer in the process could mutate via Decimal.set.
const D = Decimal.clone({ rounding: Decimal.ROUND_DOWN });

/**
 * Parse a string or number into a finite decimal.js value.
 *
 * @throws {FormatError} If the value is unparsable or not finite.
 */
function toDecimal(value: string | number, field: "price" | "size"): Decimal {
  let d: Decimal;
  try {
    d = new D(value);
  } catch (cause) {
    throw new FormatError(`Invalid ${field}: ${JSON.stringify(value)}`, { cause });
  }
  // decimal.js accepts NaN and Infinity as valid Decimals, so guard finiteness.
  if (!d.isFinite()) {
    throw new FormatError(`Invalid ${field}: ${String(value)} is not finite`);
  }
  return d;
}

/**
 * Format price according to Hyperliquid {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/tick-and-lot-size | rules}:
 * - Maximum 5 significant figures
 * - Maximum 6 (for perp) or 8 (for spot) - `szDecimals` decimal places
 * - Integer prices are always allowed regardless of significant figures
 *
 * @param price The price to format (as string or number).
 * @param szDecimals The size decimals of the asset.
 * @param type The market type: "perp" for perpetuals or "spot" for spot markets. Default: `"perp"`.
 * @return Formatted price string
 *
 * @throws {FormatError} If the price is not a valid finite number, or is truncated to 0.
 *
 * @example
 * ```ts
 * import { formatPrice } from "@nktkas/hyperliquid/utils";
 *
 * formatPrice("97123.456789", 0); // → "97123" (perp, szDecimals=0)
 * formatPrice("1.23456789", 5); // → "1.2" (perp, szDecimals=5)
 * formatPrice("0.0000123456789", 0, "spot"); // → "0.00001234" (spot, 8-decimal ceiling)
 * ```
 */
export function formatPrice(price: string | number, szDecimals: number, type: "perp" | "spot" = "perp"): string {
  const d = toDecimal(price, "price");

  const maxDecimals = Math.max((type === "perp" ? 6 : 8) - szDecimals, 0);
  let result = d.toDecimalPlaces(maxDecimals);

  // Integers are exempt from the 5-sig-fig cap.
  if (!result.isInteger()) {
    result = result.toSignificantDigits(5);
  }

  if (result.isZero()) {
    throw new FormatError("Price is too small and was truncated to 0");
  }

  return result.toFixed();
}

/**
 * Format size according to Hyperliquid {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/tick-and-lot-size | rules}:
 * - Truncate decimal places to `szDecimals`
 *
 * @param size The size to format (as string or number).
 * @param szDecimals The size decimals of the asset.
 * @return Formatted size string
 *
 * @throws {FormatError} If the size is not a valid finite number, or is truncated to 0.
 *
 * @example
 * ```ts
 * import { formatSize } from "@nktkas/hyperliquid/utils";
 *
 * formatSize("1.23456789", 5); // → "1.23456"
 * formatSize("0.123456789", 2); // → "0.12"
 * formatSize("100", 0); // → "100"
 * ```
 */
export function formatSize(size: string | number, szDecimals: number): string {
  const d = toDecimal(size, "size");

  const result = d.toDecimalPlaces(szDecimals);

  if (result.isZero()) {
    throw new FormatError("Size is too small and was truncated to 0");
  }

  return result.toFixed();
}
