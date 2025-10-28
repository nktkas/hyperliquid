import { HyperliquidError } from "../_base.ts";

/**
 * Format price according to Hyperliquid {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/tick-and-lot-size | rules}:
 * - Maximum 5 significant figures
 * - Maximum (6 for perp, 8 for spot) - `szDecimals` decimal places
 * - Integer prices are always allowed regardless of significant figures
 * - Remove trailing zeros
 */
export function formatPrice(
  price: string | number,
  szDecimals: number,
  isPerp: boolean = true,
): string {
  // Prepare: trim, validate, normalize leading/trailing zeros
  let priceStr = prepareNumber(typeof price === "string" ? price : price.toString());

  // Integer prices bypass sig figs limit per spec
  if (!priceStr.includes(".")) {
    return priceStr;
  }

  // Apply decimal limit: max (6 for perp, 8 for spot) - `szDecimals` decimals
  const maxDecimals = Math.max((isPerp ? 6 : 8) - szDecimals, 0);
  priceStr = truncateDecimals(priceStr, maxDecimals);

  // Apply sig figs limit: max 5 significant figures
  priceStr = truncateSigFigs(priceStr, 5);

  return priceStr;
}

/**
 * Format size according to Hyperliquid {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/tick-and-lot-size | rules}:
 * - Truncate to `szDecimals` decimal places
 * - Remove trailing zeros
 */
export function formatSize(size: string | number, szDecimals: number): string {
  // Prepare: trim, validate, normalize leading/trailing zeros
  let sizeStr = prepareNumber(typeof size === "string" ? size : size.toString());

  // Truncate to `szDecimals` decimal places
  sizeStr = truncateDecimals(sizeStr, szDecimals);

  return sizeStr;
}

/**
 * Prepare number string for processing:
 * 1. Trim whitespace
 * 2. Validate format (decimal number, not hex/scientific)
 * 3. Normalize: remove leading zeros from integer part, trailing zeros from decimal part
 */
function prepareNumber(numStr: string): string {
  const trimmed = numStr.trim();

  // Validate: only decimal numbers allowed (no hex, scientific notation, etc)
  if (!/^-?(\d+\.?\d*|\.\d+)$/.test(trimmed)) {
    throw new HyperliquidError(`Invalid number format: ${numStr}`);
  }

  // Normalize: remove leading zeros from integer, trailing zeros from decimal
  const [int, dec] = trimmed.split(".");
  const trimmedInt = int.replace(/^0+/, "") || "0";
  const trimmedDec = dec?.replace(/0+$/, "");
  return trimmedInt + (trimmedDec ? "." + trimmedDec : "");
}

/** String-based Math operations for arbitrary precision */
const StringMath = {
  /** Absolute value: remove negative sign if present */
  abs(numStr: string): string {
    return numStr[0] === "-" ? numStr.slice(1) : numStr;
  },

  /** Floor log10 (magnitude): position of most significant digit */
  log10Floor(numStr: string): number {
    const abs = this.abs(numStr);
    const [int, dec] = abs.split(".");

    // Number >= 1: magnitude = length of integer part - 1
    if (int !== "0") {
      const trimmed = int.replace(/^0+/, "");
      return trimmed.length - 1;
    }

    // Number < 1: count leading zeros in decimal part
    if (!dec) return -Infinity;
    const leadingZeros = dec.match(/^0*/)?.[0].length ?? 0;
    return -(leadingZeros + 1);
  },

  /** Multiply by 10^exp: shift decimal point left (negative) or right (positive) */
  multiplyByPow10(numStr: string, exp: number): string {
    if (exp === 0) return numStr;

    const neg = numStr[0] === "-";
    const abs = neg ? numStr.slice(1) : numStr;
    const [int, dec = ""] = abs.split(".");

    if (exp > 0) {
      // Shift right: move digits from decimal to integer
      if (exp >= dec.length) {
        return (neg ? "-" : "") + int + dec + "0".repeat(exp - dec.length);
      }
      return (neg ? "-" : "") + int + dec.slice(0, exp) + "." + dec.slice(exp);
    } else {
      // Shift left: move digits from integer to decimal
      const absExp = -exp;
      if (absExp >= int.length) {
        return (neg ? "-" : "") + "0." + "0".repeat(absExp - int.length) + int + dec;
      }
      return (neg ? "-" : "") + int.slice(0, -absExp) + "." + int.slice(-absExp) + dec;
    }
  },

  /** Truncate: remove decimal part */
  trunc(numStr: string): string {
    const dotIndex = numStr.indexOf(".");
    return dotIndex === -1 ? numStr : numStr.slice(0, dotIndex);
  },
};

/** Truncate to specified decimal places */
function truncateDecimals(numStr: string, maxDecimals: number): string {
  const dotIndex = numStr.indexOf(".");
  if (dotIndex === -1) return numStr;

  const truncated = numStr.substring(0, dotIndex + maxDecimals + 1);

  // Remove trailing zeros from decimal
  const [int, dec] = truncated.split(".");
  const trimmedDec = dec?.replace(/0+$/, "");
  return trimmedDec ? int + "." + trimmedDec : int;
}

/** Truncate to specified significant figures using string-based math */
function truncateSigFigs(numStr: string, maxSigFigs: number): string {
  if (parseFloat(numStr) === 0) return "0";

  const neg = numStr[0] === "-";
  const abs = neg ? numStr.slice(1) : numStr;

  // Calculate how much to shift: align most significant digit to ones place + (maxSigFigs-1)
  const magnitude = StringMath.log10Floor(abs);
  const shiftAmount = maxSigFigs - magnitude - 1;

  // Shift right, truncate integer part, shift back
  const shifted = StringMath.multiplyByPow10(abs, shiftAmount);
  const truncated = StringMath.trunc(shifted);
  const result = StringMath.multiplyByPow10(truncated, -shiftAmount);

  // Remove trailing zeros introduced by shifting
  const final = neg ? "-" + result : result;
  const [int, dec] = final.split(".");
  const trimmedDec = dec?.replace(/0+$/, "");
  return trimmedDec ? int + "." + trimmedDec : int;
}
