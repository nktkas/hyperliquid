import test from "node:test";
import assert from "node:assert";
import { formatPrice, formatSize } from "../../src/utils/mod.ts";

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

test("formatPrice", async (t) => {
  await t.test("integer bypasses sig figs limit", () => {
    assert.strictEqual(formatPrice("1234567", 0, true), "1234567");
  });

  await t.test("5 sig figs truncation", () => {
    assert.strictEqual(formatPrice("12345.6", 0, true), "12345");
    assert.strictEqual(formatPrice("0.00123456", 0, true), "0.001234");
  });

  await t.test("perp decimal limit (6 - szDecimals)", () => {
    assert.strictEqual(formatPrice("0.1234567", 0, true), "0.12345");
    assert.strictEqual(formatPrice("123.456", 5, true), "123.4");
  });

  await t.test("spot decimal limit (8 - szDecimals)", () => {
    assert.strictEqual(formatPrice("0.000123456", 0, false), "0.00012345");
    assert.strictEqual(formatPrice("0.0001234", 3, false), "0.00012");
  });

  await t.test("normalization", async (t) => {
    await t.test("trailing zeros", () => {
      assert.strictEqual(formatPrice("1.1000", 0, true), "1.1");
    });

    await t.test("leading zeros", () => {
      assert.strictEqual(formatPrice("00.123", 0, true), "0.123");
    });
  });

  await t.test("edge cases", () => {
    // Zero doesn't become empty string
    assert.strictEqual(formatPrice("0", 0, true), "0");
    // Negative numbers supported
    assert.strictEqual(formatPrice("-123.456", 0, true), "-123.45");
  });

  await t.test("invalid input throws", () => {
    assert.throws(() => formatPrice("0x1A", 0, true)); // Hex
    assert.throws(() => formatPrice("1.23e5", 0, true)); // Scientific notation
    assert.throws(() => formatPrice("abc", 0, true)); // Invalid string
  });

  await t.test("reference validation", async (t) => {
    await t.test("perpetuals", async (t) => {
      for (const { asset, szDecimals, minPrice } of REFERENCE_PERPS_DATA) {
        await t.test(`${asset} (szDecimals=${szDecimals})`, () => {
          const formatted = formatPrice(minPrice, szDecimals, true);
          assert.strictEqual(formatted, minPrice);
        });
      }
    });

    await t.test("spots", async (t) => {
      for (const { asset, szDecimals, minPrice } of REFERENCE_SPOTS_DATA) {
        await t.test(`${asset} (szDecimals=${szDecimals})`, () => {
          const formatted = formatPrice(minPrice, szDecimals, false);
          assert.strictEqual(formatted, minPrice);
        });
      }
    });
  });
});

test("formatSize", async (t) => {
  await t.test("truncates to szDecimals", () => {
    assert.strictEqual(formatSize("123.456789", 2), "123.45");
  });

  await t.test("normalization", async (t) => {
    await t.test("trailing zeros", () => {
      assert.strictEqual(formatSize("1.0000", 4), "1");
    });

    await t.test("leading zeros", () => {
      assert.strictEqual(formatSize("00.123", 3), "0.123");
    });
  });

  await t.test("edge cases", () => {
    // Zero doesn't become empty string
    assert.strictEqual(formatSize("0", 0), "0");
    // Negative numbers supported
    assert.strictEqual(formatSize("-10.5", 1), "-10.5");
  });

  await t.test("invalid input throws", () => {
    assert.throws(() => formatSize("0xFF", 0)); // Hex
    assert.throws(() => formatSize("5e-3", 0)); // Scientific notation
    assert.throws(() => formatSize("invalid", 0)); // Invalid string
  });

  await t.test("reference validation", async (t) => {
    await t.test("perpetuals", async (t) => {
      for (const { asset, szDecimals, minSize } of REFERENCE_PERPS_DATA) {
        await t.test(`${asset} (szDecimals=${szDecimals})`, () => {
          const formatted = formatSize(minSize, szDecimals);
          assert.strictEqual(formatted, minSize);
        });
      }
    });

    await t.test("spots", async (t) => {
      for (const { asset, szDecimals, minSize } of REFERENCE_SPOTS_DATA) {
        await t.test(`${asset} (szDecimals=${szDecimals})`, () => {
          const formatted = formatSize(minSize, szDecimals);
          assert.strictEqual(formatted, minSize);
        });
      }
    });
  });
});
