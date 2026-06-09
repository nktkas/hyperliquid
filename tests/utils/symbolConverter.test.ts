// deno-lint-ignore-file no-import-prefix

import { assertEquals } from "jsr:@std/assert@1";
import { HttpTransport, type IRequestTransport } from "@nktkas/hyperliquid";
import { SymbolConverter } from "@nktkas/hyperliquid/utils";
import type { OutcomeMetaResponse } from "@nktkas/hyperliquid/api/info";

// ============================================================
// Helpers
// ============================================================

/** Builds a request transport that serves a fixed `outcomeMeta` and empty perpetual/spot metadata. */
function createOutcomeTransport(outcomeMeta: OutcomeMetaResponse): IRequestTransport {
  const responses: Record<string, unknown> = {
    meta: { universe: [] },
    spotMeta: { tokens: [], universe: [] },
    outcomeMeta,
  };
  return {
    isTestnet: false,
    request<T>(_endpoint: "info" | "exchange" | "explorer", payload: unknown): Promise<T> {
      const { type } = payload as { type: string };
      return Promise.resolve(responses[type] as T);
    },
  };
}

// ============================================================
// Test Data
// ============================================================

const PERP_EXPECTATIONS = {
  BTC: { assetId: 0, szDecimals: 5 },
  ETH: { assetId: 1, szDecimals: 4 },
} as const;

const SPOT_EXPECTATIONS = {
  "PURR/USDC": { assetId: 10000, szDecimals: 0, pairId: "PURR/USDC" },
  "HYPE/USDC": { assetId: 10107, szDecimals: 2, pairId: "@107" },
} as const;

const DEX_EXPECTATIONS = {
  "test:ABC": { assetId: 110000 },
  "unit:ES": { assetId: 120000 },
} as const;

/** A trimmed `outcomeMeta` response covering every supported market type, modeled on real mainnet data. */
const OUTCOME_META: OutcomeMetaResponse = {
  outcomes: [
    {
      outcome: 220,
      name: "Recurring",
      description: "class:priceBinary|underlying:BTC|expiry:20260608-0600|targetPrice:61720|period:1d",
      sideSpecs: [{ name: "Yes" }, { name: "No" }],
      quoteToken: "USDC",
    },
    {
      outcome: 222,
      name: "Recurring Named Outcome",
      description: "index:0",
      sideSpecs: [{ name: "Yes" }, { name: "No" }],
      quoteToken: "USDC",
    },
    {
      outcome: 223,
      name: "Recurring Named Outcome",
      description: "index:1",
      sideSpecs: [{ name: "Yes" }, { name: "No" }],
      quoteToken: "USDC",
    },
    {
      outcome: 224,
      name: "Recurring Named Outcome",
      description: "index:2",
      sideSpecs: [{ name: "Yes" }, { name: "No" }],
      quoteToken: "USDC",
    },
    {
      outcome: 170,
      name: "NBA Finals Game 3",
      description: "metadata=category:sports|subCategory:basketball",
      sideSpecs: [{ name: "San Antonio" }, { name: "New York" }],
      quoteToken: "USDC",
    },
    {
      outcome: 173,
      name: "Argentina",
      description: "",
      sideSpecs: [{ name: "Yes" }, { name: "No" }],
      quoteToken: "USDC",
    },
    {
      outcome: 101,
      name: "Below 4.3%",
      description: "",
      sideSpecs: [{ name: "Yes" }, { name: "No" }],
      quoteToken: "USDC",
    },
    {
      outcome: 100,
      name: "Fallback",
      description: "",
      sideSpecs: [{ name: "Yes" }, { name: "No" }],
      quoteToken: "USDC",
    },
    {
      outcome: 171,
      name: "Fallback",
      description: "",
      sideSpecs: [{ name: "Yes" }, { name: "No" }],
      quoteToken: "USDC",
    },
    {
      outcome: 221,
      name: "Recurring Fallback",
      description: "",
      sideSpecs: [{ name: "Yes" }, { name: "No" }],
      quoteToken: "USDC",
    },
  ],
  questions: [
    {
      question: 33,
      name: "Recurring",
      description: "class:priceBucket|underlying:BTC|expiry:20260608-0600|priceThresholds:60485,62954|period:1d",
      fallbackOutcome: 221,
      namedOutcomes: [222, 223, 224],
      settledNamedOutcomes: [],
    },
    {
      question: 32,
      name: "2026 World Cup Champion",
      description: "",
      fallbackOutcome: 171,
      namedOutcomes: [173],
      settledNamedOutcomes: [],
    },
    {
      question: 19,
      name: "May CPI year-over-year",
      description: "",
      fallbackOutcome: 100,
      namedOutcomes: [101],
      settledNamedOutcomes: [],
    },
  ],
};

// ============================================================
// Tests
// ============================================================

Deno.test("SymbolConverter", async (t) => {
  const transport = new HttpTransport();
  const converter = await SymbolConverter.create({ transport });

  await t.step("getAssetId()", async (t) => {
    await t.step("perpetuals", () => {
      assertEquals(converter.getAssetId("BTC"), PERP_EXPECTATIONS.BTC.assetId);
      assertEquals(converter.getAssetId("ETH"), PERP_EXPECTATIONS.ETH.assetId);
    });

    await t.step("spot", () => {
      assertEquals(converter.getAssetId("PURR/USDC"), SPOT_EXPECTATIONS["PURR/USDC"].assetId);
      assertEquals(converter.getAssetId("HYPE/USDC"), SPOT_EXPECTATIONS["HYPE/USDC"].assetId);
    });

    await t.step("non-existent returns undefined", () => {
      assertEquals(converter.getAssetId("NONEXISTENT"), undefined);
      assertEquals(converter.getAssetId("NONE/EXISTENT"), undefined);
    });
  });

  await t.step("getSzDecimals()", async (t) => {
    await t.step("perpetuals", () => {
      assertEquals(converter.getSzDecimals("BTC"), PERP_EXPECTATIONS.BTC.szDecimals);
      assertEquals(converter.getSzDecimals("ETH"), PERP_EXPECTATIONS.ETH.szDecimals);
    });

    await t.step("spot", () => {
      assertEquals(converter.getSzDecimals("PURR/USDC"), SPOT_EXPECTATIONS["PURR/USDC"].szDecimals);
      assertEquals(converter.getSzDecimals("HYPE/USDC"), SPOT_EXPECTATIONS["HYPE/USDC"].szDecimals);
    });

    await t.step("non-existent returns undefined", () => {
      assertEquals(converter.getSzDecimals("NONEXISTENT"), undefined);
      assertEquals(converter.getSzDecimals("NONE/EXISTENT"), undefined);
    });
  });

  await t.step("getSpotPairId()", async (t) => {
    await t.step("existing pair", () => {
      assertEquals(converter.getSpotPairId("PURR/USDC"), SPOT_EXPECTATIONS["PURR/USDC"].pairId);
      assertEquals(converter.getSpotPairId("HYPE/USDC"), SPOT_EXPECTATIONS["HYPE/USDC"].pairId);
    });

    await t.step("non-existent returns undefined", () => {
      assertEquals(converter.getSpotPairId("NONE/EXISTENT"), undefined);
      assertEquals(converter.getSpotPairId("BTC"), undefined);
    });
  });

  await t.step("getSymbolBySpotPairId()", async (t) => {
    await t.step("existing pair id", () => {
      assertEquals(converter.getSymbolBySpotPairId(SPOT_EXPECTATIONS["PURR/USDC"].pairId), "PURR/USDC");
      assertEquals(converter.getSymbolBySpotPairId(SPOT_EXPECTATIONS["HYPE/USDC"].pairId), "HYPE/USDC");
    });

    await t.step("non-existent returns undefined", () => {
      assertEquals(converter.getSymbolBySpotPairId("@999999"), undefined);
      assertEquals(converter.getSymbolBySpotPairId("NONEXISTENT"), undefined);
    });
  });

  await t.step("reload()", async () => {
    const freshConverter = new SymbolConverter({ transport });

    // Before reload, mappings are empty
    const before = freshConverter.getAssetId("BTC");
    assertEquals(before, undefined);

    // After reload, mappings are populated
    await freshConverter.reload();
    const after = freshConverter.getAssetId("BTC");
    assertEquals(after, PERP_EXPECTATIONS.BTC.assetId);
  });

  await t.step("create({ dexs })", async (t) => {
    const testnetTransport = new HttpTransport({ isTestnet: true });

    await t.step("dexs: false excludes all dexs", async () => {
      const conv = await SymbolConverter.create({ transport: testnetTransport, dexs: false });

      assertEquals(conv.getAssetId("test:ABC"), undefined);
      assertEquals(conv.getAssetId("unit:ES"), undefined);
    });

    await t.step("dexs: [] excludes all dexs", async () => {
      const conv = await SymbolConverter.create({ transport: testnetTransport, dexs: [] });

      assertEquals(conv.getAssetId("test:ABC"), undefined);
      assertEquals(conv.getAssetId("unit:ES"), undefined);
    });

    await t.step("dexs: [specific] includes only specified", async () => {
      const conv = await SymbolConverter.create({ transport: testnetTransport, dexs: ["test"] });

      assertEquals(conv.getAssetId("test:ABC"), DEX_EXPECTATIONS["test:ABC"].assetId);
      assertEquals(conv.getAssetId("unit:ES"), undefined);
    });

    await t.step("dexs: true includes all dexs", async () => {
      const conv = await SymbolConverter.create({ transport: testnetTransport, dexs: true });

      assertEquals(conv.getAssetId("test:ABC"), DEX_EXPECTATIONS["test:ABC"].assetId);
      assertEquals(conv.getAssetId("unit:ES"), DEX_EXPECTATIONS["unit:ES"].assetId);
    });
  });
});

Deno.test("SymbolConverter outcome markets", async (t) => {
  const converter = await SymbolConverter.create({ transport: createOutcomeTransport(OUTCOME_META) });

  await t.step("getAssetId()", async (t) => {
    await t.step("recurring binary", () => {
      assertEquals(converter.getAssetId("btc-above-61720-yes-jun-08-0600"), 100002200);
      assertEquals(converter.getAssetId("btc-above-61720-no-jun-08-0600"), 100002201);
    });

    await t.step("recurring bucket", () => {
      assertEquals(converter.getAssetId("btc-price-range-jun-08-0600-below-60485-yes"), 100002220);
      assertEquals(converter.getAssetId("btc-price-range-jun-08-0600-60485-to-62954-yes"), 100002230);
      assertEquals(converter.getAssetId("btc-price-range-jun-08-0600-above-62954-yes"), 100002240);
    });

    await t.step("sports", () => {
      assertEquals(converter.getAssetId("nba-finals-game-3-san-antonio"), 100001700);
      assertEquals(converter.getAssetId("nba-finals-game-3-new-york"), 100001701);
    });

    await t.step("categorical", () => {
      assertEquals(converter.getAssetId("2026-world-cup-champion-argentina-yes"), 100001730);
      assertEquals(converter.getAssetId("2026-world-cup-champion-argentina-no"), 100001731);
      assertEquals(converter.getAssetId("may-cpi-year-over-year-below-43-yes"), 100001010);
    });

    await t.step("fallback outcomes are skipped", () => {
      assertEquals(converter.getAssetId("fallback"), undefined);
      assertEquals(converter.getAssetId("recurring-fallback"), undefined);
    });
  });

  await t.step("getSzDecimals()", () => {
    assertEquals(converter.getSzDecimals("nba-finals-game-3-san-antonio"), 5);
    assertEquals(converter.getSzDecimals("2026-world-cup-champion-argentina-yes"), 5);
  });
});
