/**
 * Format price according to Hyperliquid {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/tick-and-lot-size | rules}:
 * - Maximum 5 significant figures
 * - Maximum 6 (for perp) or 8 (for spot) - `szDecimals` decimal places
 * - Integer prices are always allowed regardless of significant figures
 * @example
 * ```ts
 * import { formatPrice } from "@nktkas/hyperliquid/utils";
 *
 * //        `true` for perp (default), `false` for spot
 * //                                              ⌄⌄⌄⌄⌄
 * const price = formatPrice("0.0000123456789", 0, false); // → "0.00001234"
 * ```
 */
export function formatPrice(price: string | number, szDecimals: number, isPerp: boolean = true): string {
  price = price.toString().trim();
  assertNumberString(price);

  // Integer prices are always allowed
  if (/^-?\d+$/.test(price)) return trimZeros(price);

  // Apply decimal limit: max 6 (perp) or 8 (spot) - szDecimals
  const maxDecimals = Math.max((isPerp ? 6 : 8) - szDecimals, 0);
  price = StringMath.toFixedTruncate(price, maxDecimals);

  // Apply sig figs limit: max 5 significant figures
  price = StringMath.toPrecisionTruncate(price, 5);

  return price;
}

/**
 * Format size according to Hyperliquid {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/tick-and-lot-size | rules}:
 * - Truncate decimal places to `szDecimals`
 * @example
 * ```ts
 * import { formatSize } from "@nktkas/hyperliquid/utils";
 *
 * const size = formatSize("1.23456789", 5); // → "1.23456"
 * ```
 * @note May return 0 if the value is not suitable, but when closing a position, a size of 0 means the full size.
 */
export function formatSize(size: string | number, szDecimals: number): string {
  size = size.toString().trim();
  assertNumberString(size);

  // Apply decimal limit: szDecimals
  size = StringMath.toFixedTruncate(size, szDecimals);

  return size;
}

/** String-based Math operations for arbitrary precision */
const StringMath = {
  /** Floor log10 (magnitude): position of most significant digit */
  log10Floor(value: string): number {
    const abs = value[0] === "-" ? value.slice(1) : value;

    // Check if zero or invalid
    const num = Number(abs);
    if (num === 0 || isNaN(num)) return -Infinity;

    const [int, dec] = abs.split(".");

    // Number >= 1: magnitude = length of integer part - 1
    if (Number(int) !== 0) {
      const trimmed = int.replace(/^0+/, "");
      return trimmed.length - 1;
    }

    // Number < 1: count leading zeros in decimal part
    const leadingZeros = dec.match(/^0*/)?.[0].length ?? 0;
    return -(leadingZeros + 1);
  },

  /** Multiply by 10^exp: shift decimal point left (negative) or right (positive) */
  multiplyByPow10(value: string, exp: number): string {
    if (!Number.isInteger(exp)) throw new RangeError("Exponent must be an integer");
    if (exp === 0) return trimZeros(value);

    const neg = value[0] === "-";
    const abs = neg ? value.slice(1) : value;
    const [intRaw, dec = ""] = abs.split(".");
    // Normalize empty integer part to "0" (handles ".5" → "0.5")
    const int = intRaw || "0";

    let result: string;

    if (exp > 0) {
      // Shift right: move digits from decimal to integer
      if (exp >= dec.length) {
        result = int + dec + "0".repeat(exp - dec.length);
      } else {
        result = int + dec.slice(0, exp) + "." + dec.slice(exp);
      }
    } else {
      // Shift left: move digits from integer to decimal
      const absExp = -exp;
      if (absExp >= int.length) {
        result = "0." + "0".repeat(absExp - int.length) + int + dec;
      } else {
        result = int.slice(0, -absExp) + "." + int.slice(-absExp) + dec;
      }
    }

    return trimZeros((neg ? "-" : "") + result);
  },

  /** Returns the integer part of a number by removing any fractional digits */
  trunc(value: string): string {
    const dotIndex = value.indexOf(".");
    return dotIndex === -1 ? value : value.slice(0, dotIndex) || "0";
  },

  /** Truncate to a certain number of significant figures */
  toPrecisionTruncate(value: string, precision: number): string {
    if (!Number.isInteger(precision)) throw new RangeError("Precision must be an integer");
    if (precision < 1) throw new RangeError("Precision must be positive");
    if (/^-?0+(\.0*)?$/.test(value)) return "0"; // zero is special case (don't work with log10)

    const neg = value[0] === "-";
    const abs = neg ? value.slice(1) : value;

    // Calculate how much to shift: align most significant digit to ones place + (maxSigFigs-1)
    const magnitude = StringMath.log10Floor(abs);
    const shiftAmount = precision - magnitude - 1;

    // Shift right, truncate integer part, shift back
    const shifted = StringMath.multiplyByPow10(abs, shiftAmount);
    const truncated = StringMath.trunc(shifted);
    const result = StringMath.multiplyByPow10(truncated, -shiftAmount);

    // build final result and trim zeros
    return trimZeros(neg ? "-" + result : result);
  },

  /** Truncate to a certain number of decimal places */
  toFixedTruncate(value: string, decimals: number): string {
    if (!Number.isInteger(decimals)) throw new RangeError("Decimals must be an integer");
    if (decimals < 0) throw new RangeError("Decimals must be non-negative");

    // Match number with up to `decimals` decimal places
    const regex = new RegExp(`^-?(?:\\d+)?(?:\\.\\d{0,${decimals}})?`);
    const result = value.match(regex)?.[0];

    if (!result) {
      throw new TypeError("Invalid number format");
    }

    // Trim zeros after truncation
    return trimZeros(result);
  },
};

function trimZeros(value: string): string {
  return value
    // remove leading zeros
    .replace(/^(-?)0+(?=\d)/, "$1") // "00123" → "123", "-00.5" → "-0.5"
    // remove trailing zeros
    .replace(/\.0*$|(\.\d+?)0+$/, "$1") // "1.2000" → "1.2", "5.0" → "5"
    // add leading zero if starts with decimal point
    .replace(/^(-?)\./, "$10.") // ".5" → "0.5", "-.5" → "-0.5"
    // add "0" if string is empty after trimming
    .replace(/^-?$/, "0") // "" → "0", "-" → "0"
    // normalize negative zero
    .replace(/^-0$/, "0"); // "-0" → "0"
}

function assertNumberString(value: string): void {
  if (!/^-?(\d+\.?\d*|\.\d*)$/.test(value)) {
    throw new TypeError("Invalid number format");
  }
}
