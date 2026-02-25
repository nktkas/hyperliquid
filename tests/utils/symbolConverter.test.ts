// deno-lint-ignore-file no-import-prefix

import { assertEquals } from "jsr:@std/assert@1";
import { HttpTransport } from "@nktkas/hyperliquid";
import { SymbolConverter } from "@nktkas/hyperliquid/utils";

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
