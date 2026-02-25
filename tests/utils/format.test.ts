// deno-lint-ignore-file no-import-prefix

import { assertEquals, assertThrows } from "jsr:@std/assert@1";
import { formatPrice, formatSize } from "@nktkas/hyperliquid/utils";

// ============================================================
// Test Data
// ============================================================

const REFERENCE_PERPS = [
  { asset: "PURR", szDecimals: 0, minPrice: "0.0001", minSize: "1" },
  { asset: "DYDX", szDecimals: 1, minPrice: "0.00001", minSize: "0.1" },
  { asset: "SOL", szDecimals: 2, minPrice: "0.01", minSize: "0.01" },
  { asset: "BNB", szDecimals: 3, minPrice: "0.1", minSize: "0.001" },
  { asset: "ETH", szDecimals: 4, minPrice: "0.1", minSize: "0.0001" },
  { asset: "BTC", szDecimals: 5, minPrice: "1", minSize: "0.00001" },
] as const;

const REFERENCE_SPOTS = [
  { asset: "PURR/USDC", szDecimals: 0, minPrice: "0.0001", minSize: "1" },
  { asset: "HYPE/USDC", szDecimals: 2, minPrice: "0.001", minSize: "0.01" },
  { asset: "UETH/USDC", szDecimals: 4, minPrice: "0.1", minSize: "0.0001" },
] as const;

// ============================================================
// Tests
// ============================================================

Deno.test("formatPrice", async (t) => {
  await t.step("sig figs", async (t) => {
    await t.step("integer bypasses limit", () => {
      assertEquals(formatPrice("1234567", 0), "1234567");
    });

    await t.step("truncates to 5 sig figs", () => {
      assertEquals(formatPrice("12345.6", 0), "12345");
      assertEquals(formatPrice("0.00123456", 0), "0.001234");
    });
  });

  await t.step("decimal limits", async (t) => {
    await t.step("perp: 6 - szDecimals", () => {
      assertEquals(formatPrice("0.1234567", 0), "0.12345");
      assertEquals(formatPrice("123.456", 5), "123.4");
    });

    await t.step("spot: 8 - szDecimals", () => {
      assertEquals(formatPrice("0.000123456", 0, "spot"), "0.00012345");
      assertEquals(formatPrice("0.0001234", 3, "spot"), "0.00012");
    });
  });

  await t.step("normalization", async (t) => {
    await t.step("removes trailing zeros", () => {
      assertEquals(formatPrice("1.1000", 0), "1.1");
    });

    await t.step("removes leading zeros", () => {
      assertEquals(formatPrice("00.123", 0), "0.123");
    });
  });

  await t.step("edge cases", async (t) => {
    await t.step("zero throws RangeError", () => {
      assertThrows(() => formatPrice("0.0000001", 0), RangeError);
    });

    await t.step("negative numbers supported", () => {
      assertEquals(formatPrice("-123.456", 0), "-123.45");
    });
  });

  await t.step("invalid input throws", () => {
    assertThrows(() => formatPrice("0x1A", 0));
    assertThrows(() => formatPrice("1.23e5", 0));
    assertThrows(() => formatPrice("abc", 0));
  });

  await t.step("reference validation", async (t) => {
    await t.step("perpetuals", async (t) => {
      for (const { asset, szDecimals, minPrice } of REFERENCE_PERPS) {
        await t.step(`${asset}`, () => {
          assertEquals(formatPrice(minPrice, szDecimals), minPrice);
        });
      }
    });

    await t.step("spots", async (t) => {
      for (const { asset, szDecimals, minPrice } of REFERENCE_SPOTS) {
        await t.step(`${asset}`, () => {
          assertEquals(formatPrice(minPrice, szDecimals, "spot"), minPrice);
        });
      }
    });
  });
});

Deno.test("formatSize", async (t) => {
  await t.step("truncates to szDecimals", () => {
    assertEquals(formatSize("123.456789", 2), "123.45");
  });

  await t.step("normalization", async (t) => {
    await t.step("removes trailing zeros", () => {
      assertEquals(formatSize("1.0000", 4), "1");
    });

    await t.step("removes leading zeros", () => {
      assertEquals(formatSize("00.123", 3), "0.123");
    });
  });

  await t.step("edge cases", async (t) => {
    await t.step("zero throws RangeError", () => {
      assertThrows(() => formatSize("0.0000001", 0), RangeError);
    });

    await t.step("negative numbers supported", () => {
      assertEquals(formatSize("-10.5", 1), "-10.5");
    });
  });

  await t.step("invalid input throws", () => {
    assertThrows(() => formatSize("0xFF", 0));
    assertThrows(() => formatSize("5e-3", 0));
    assertThrows(() => formatSize("invalid", 0));
  });

  await t.step("reference validation", async (t) => {
    await t.step("perpetuals", async (t) => {
      for (const { asset, szDecimals, minSize } of REFERENCE_PERPS) {
        await t.step(`${asset}`, () => {
          assertEquals(formatSize(minSize, szDecimals), minSize);
        });
      }
    });

    await t.step("spots", async (t) => {
      for (const { asset, szDecimals, minSize } of REFERENCE_SPOTS) {
        await t.step(`${asset}`, () => {
          assertEquals(formatSize(minSize, szDecimals), minSize);
        });
      }
    });
  });
});
