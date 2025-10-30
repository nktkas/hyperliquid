// deno-lint-ignore no-import-prefix
import { assertEquals, assertThrows } from "jsr:@std/assert@1";
import { formatPrice, formatSize } from "@nktkas/hyperliquid/utils";

const REFERENCE_PERPS_DATA = [
  {
    asset: "PURR",
    szDecimals: 0,
    minPrice: "0.0001",
    minSize: "1",
  },
  {
    asset: "DYDX",
    szDecimals: 1,
    minPrice: "0.00001",
    minSize: "0.1",
  },
  {
    asset: "SOL",
    szDecimals: 2,
    minPrice: "0.01",
    minSize: "0.01",
  },
  {
    asset: "BNB",
    szDecimals: 3,
    minPrice: "0.1",
    minSize: "0.001",
  },
  {
    asset: "ETH",
    szDecimals: 4,
    minPrice: "0.1",
    minSize: "0.0001",
  },
  {
    asset: "BTC",
    szDecimals: 5,
    minPrice: "1",
    minSize: "0.00001",
  },
];
const REFERENCE_SPOTS_DATA = [
  {
    asset: "PURR/USDC",
    szDecimals: 0,
    minPrice: "0.0001",
    minSize: "1",
  },
  {
    asset: "HYPE/USDC",
    szDecimals: 2,
    minPrice: "0.001",
    minSize: "0.01",
  },
  {
    asset: "UETH/USDC",
    szDecimals: 4,
    minPrice: "0.1",
    minSize: "0.0001",
  },
];

Deno.test("formatPrice", async (t) => {
  await t.step("integer bypasses sig figs limit", () => {
    assertEquals(formatPrice("1234567", 0, true), "1234567");
  });

  await t.step("5 sig figs truncation", () => {
    assertEquals(formatPrice("12345.6", 0, true), "12345");
    assertEquals(formatPrice("0.00123456", 0, true), "0.001234");
  });

  await t.step("perp decimal limit (6 - szDecimals)", () => {
    assertEquals(formatPrice("0.1234567", 0, true), "0.12345");
    assertEquals(formatPrice("123.456", 5, true), "123.4");
  });

  await t.step("spot decimal limit (8 - szDecimals)", () => {
    assertEquals(formatPrice("0.000123456", 0, false), "0.00012345");
    assertEquals(formatPrice("0.0001234", 3, false), "0.00012");
  });

  await t.step("normalization", async (t) => {
    await t.step("trailing zeros", () => {
      assertEquals(formatPrice("1.1000", 0, true), "1.1");
    });

    await t.step("leading zeros", () => {
      assertEquals(formatPrice("00.123", 0, true), "0.123");
    });
  });

  await t.step("edge cases", () => {
    // Zero doesn't become empty string
    assertEquals(formatPrice("0", 0, true), "0");
    // Negative numbers supported
    assertEquals(formatPrice("-123.456", 0, true), "-123.45");
  });

  await t.step("invalid input throws", () => {
    assertThrows(() => formatPrice("0x1A", 0, true)); // Hex
    assertThrows(() => formatPrice("1.23e5", 0, true)); // Scientific notation
    assertThrows(() => formatPrice("abc", 0, true)); // Invalid string
  });

  await t.step("reference validation", async (t) => {
    await t.step("perpetuals", async (t) => {
      for (const { asset, szDecimals, minPrice } of REFERENCE_PERPS_DATA) {
        await t.step(`${asset} (szDecimals=${szDecimals})`, () => {
          const formatted = formatPrice(minPrice, szDecimals, true);
          assertEquals(formatted, minPrice);
        });
      }
    });

    await t.step("spots", async (t) => {
      for (const { asset, szDecimals, minPrice } of REFERENCE_SPOTS_DATA) {
        await t.step(`${asset} (szDecimals=${szDecimals})`, () => {
          const formatted = formatPrice(minPrice, szDecimals, false);
          assertEquals(formatted, minPrice);
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
    await t.step("trailing zeros", () => {
      assertEquals(formatSize("1.0000", 4), "1");
    });

    await t.step("leading zeros", () => {
      assertEquals(formatSize("00.123", 3), "0.123");
    });
  });

  await t.step("edge cases", () => {
    // Zero doesn't become empty string
    assertEquals(formatSize("0", 0), "0");
    // Negative numbers supported
    assertEquals(formatSize("-10.5", 1), "-10.5");
  });

  await t.step("invalid input throws", () => {
    assertThrows(() => formatSize("0xFF", 0)); // Hex
    assertThrows(() => formatSize("5e-3", 0)); // Scientific notation
    assertThrows(() => formatSize("invalid", 0)); // Invalid string
  });

  await t.step("reference validation", async (t) => {
    await t.step("perpetuals", async (t) => {
      for (const { asset, szDecimals, minSize } of REFERENCE_PERPS_DATA) {
        await t.step(`${asset} (szDecimals=${szDecimals})`, () => {
          const formatted = formatSize(minSize, szDecimals);
          assertEquals(formatted, minSize);
        });
      }
    });

    await t.step("spots", async (t) => {
      for (const { asset, szDecimals, minSize } of REFERENCE_SPOTS_DATA) {
        await t.step(`${asset} (szDecimals=${szDecimals})`, () => {
          const formatted = formatSize(minSize, szDecimals);
          assertEquals(formatted, minSize);
        });
      }
    });
  });
});
