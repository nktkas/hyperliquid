import test from "node:test";
import assert from "node:assert";
import { HttpTransport } from "../../src/mod.ts";
import { SymbolConverter } from "../../src/utils/mod.ts";

test("SymbolConverter", async (t) => {
  await t.test("perpetuals", async (t) => {
    const transport = new HttpTransport();
    const converter = await SymbolConverter.create({ transport });

    await t.test("getAssetId", () => {
      const btcId = converter.getAssetId("BTC");
      const ethId = converter.getAssetId("ETH");

      assert.strictEqual(btcId, 0, `BTC asset ID should be 0, but got ${btcId}`);
      assert.strictEqual(ethId, 1, `ETH asset ID should be 1, but got ${ethId}`);
    });

    await t.test("getSzDecimals", () => {
      const btcDecimals = converter.getSzDecimals("BTC");
      const ethDecimals = converter.getSzDecimals("ETH");

      assert.strictEqual(btcDecimals, 5, `BTC size decimals should be 5, but got ${btcDecimals}`);
      assert.strictEqual(ethDecimals, 4, `ETH size decimals should be 4, but got ${ethDecimals}`);
    });

    await t.test("non-existent symbol", () => {
      const nonExistentId = converter.getAssetId("NONEXISTENT");
      const nonExistentDecimals = converter.getSzDecimals("NONEXISTENT");

      assert.strictEqual(
        nonExistentId,
        undefined,
        `NONEXISTENT asset ID should be undefined, but got ${nonExistentId}`,
      );
      assert.strictEqual(
        nonExistentDecimals,
        undefined,
        `NONEXISTENT size decimals should be undefined, but got ${nonExistentDecimals}`,
      );
    });
  });

  await t.test("spot markets", async (t) => {
    const transport = new HttpTransport();
    const converter = await SymbolConverter.create({ transport });

    await t.test("getAssetId", () => {
      const purrUsdcId = converter.getAssetId("PURR/USDC");
      const hypeUsdcId = converter.getAssetId("HYPE/USDC");

      assert.strictEqual(purrUsdcId, 10000, `PURR/USDC asset ID should be 10000, but got ${purrUsdcId}`);
      assert.strictEqual(hypeUsdcId, 10107, `HYPE/USDC asset ID should be 10107, but got ${hypeUsdcId}`);
    });

    await t.test("getSzDecimals", () => {
      const purrUsdcDecimals = converter.getSzDecimals("PURR/USDC");
      const hypeUsdcDecimals = converter.getSzDecimals("HYPE/USDC");

      assert.strictEqual(purrUsdcDecimals, 0, `PURR/USDC size decimals should be 0, but got ${purrUsdcDecimals}`);
      assert.strictEqual(hypeUsdcDecimals, 2, `HYPE/USDC size decimals should be 2, but got ${hypeUsdcDecimals}`);
    });

    await t.test("non-existent pair", () => {
      const noneExistentId = converter.getAssetId("NONE/EXISTENT");
      const noneExistentDecimals = converter.getSzDecimals("NONE/EXISTENT");

      assert.strictEqual(
        noneExistentId,
        undefined,
        `NONE/EXISTENT asset ID should be undefined, but got ${noneExistentId}`,
      );
      assert.strictEqual(
        noneExistentDecimals,
        undefined,
        `NONE/EXISTENT size decimals should be undefined, but got ${noneExistentDecimals}`,
      );
    });
  });

  await t.test("spot pair IDs", async (t) => {
    const transport = new HttpTransport();
    const converter = await SymbolConverter.create({ transport });

    await t.test("existing pair", () => {
      const hypeUsdcPairId = converter.getSpotPairId("HYPE/USDC");
      const purrUsdcPairId = converter.getSpotPairId("PURR/USDC");

      assert.strictEqual(
        hypeUsdcPairId,
        "@107",
        `HYPE/USDC spot pair ID should be @107, but got ${hypeUsdcPairId}`,
      );
      assert.strictEqual(
        purrUsdcPairId,
        "PURR/USDC",
        `PURR/USDC spot pair ID should be PURR/USDC, but got ${purrUsdcPairId}`,
      );
    });

    await t.test("non-existent pair", () => {
      const noneExistentPairId = converter.getSpotPairId("NONE/EXISTENT");
      const btcPairId = converter.getSpotPairId("BTC"); // not a spot market

      assert.strictEqual(
        noneExistentPairId,
        undefined,
        `NONE/EXISTENT spot pair ID should be undefined, but got ${noneExistentPairId}`,
      );
      assert.strictEqual(
        btcPairId,
        undefined,
        `BTC spot pair ID should be undefined, but got ${btcPairId}`,
      );
    });
  });

  await t.test("reload", async () => {
    const transport = new HttpTransport();
    const converter = await SymbolConverter.create({ transport });

    // Rewrite with other values to ensure reload works
    converter["nameToAssetId"].set("BTC", 9999);

    const btcIdBefore = converter.getAssetId("BTC");
    await converter.reload();
    const btcIdAfter = converter.getAssetId("BTC");

    assert.notStrictEqual(
      btcIdBefore,
      btcIdAfter,
      `BTC asset ID should change after reload from ${btcIdBefore} to ${btcIdAfter}`,
    );
  });

  await t.test("builder dex", async (t) => {
    const transport = new HttpTransport({ isTestnet: true });

    await t.test("dexs: false", async () => {
      const converter = await SymbolConverter.create({ transport, dexs: false });

      const testAbcId = converter.getAssetId("test:ABC");
      const unitEsId = converter.getAssetId("unit:ES");

      assert.strictEqual(testAbcId, undefined, `test:ABC asset ID should be undefined, but got ${testAbcId}`);
      assert.strictEqual(unitEsId, undefined, `unit:ES asset ID should be undefined, but got ${unitEsId}`);
    });

    await t.test("dexs: [specific dex]", async () => {
      const converter = await SymbolConverter.create({ transport, dexs: ["test"] });

      const testAbcId = converter.getAssetId("test:ABC");
      const unitEsId = converter.getAssetId("unit:ES");

      assert.strictEqual(testAbcId, 110000, `test:ABC asset ID should be 110000, but got ${testAbcId}`);
      assert.strictEqual(unitEsId, undefined, `unit:ES asset ID should be undefined, but got ${unitEsId}`);
    });

    await t.test("dexs: true", async () => {
      const converter = await SymbolConverter.create({ transport, dexs: true });

      const testAbcId = converter.getAssetId("test:ABC");
      const unitEsId = converter.getAssetId("unit:ES");

      assert.strictEqual(testAbcId, 110000, `test:ABC asset ID should be 110000, but got ${testAbcId}`);
      assert.strictEqual(unitEsId, 120000, `unit:ES asset ID should be 120000, but got ${unitEsId}`);
    });
  });
});
