// deno-lint-ignore-file no-import-prefix
import { parser, SuccessResponse, UpdateIsolatedMarginRequest } from "@nktkas/hyperliquid/api/exchange";
import { BigNumber } from "npm:bignumber.js@9";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { formatPrice, formatSize, getAssetData, runTest } from "./_t.ts";

runTest({
  name: "updateIsolatedMargin",
  topup: { perp: "15" },
  codeTestFn: async (_t, clients) => {
    // —————————— Prepare ——————————

    const { id, universe, ctx } = await getAssetData("BTC");
    const pxUp = formatPrice(new BigNumber(ctx.markPx).times(1.01), universe.szDecimals);
    const pxDown = formatPrice(new BigNumber(ctx.markPx).times(0.99), universe.szDecimals);
    const sz = formatSize(new BigNumber(15).div(ctx.markPx), universe.szDecimals);

    await clients.exchange.updateLeverage({ asset: id, isCross: false, leverage: 1 });
    await clients.exchange.order({
      orders: [{
        a: id,
        b: true,
        p: pxUp,
        s: sz,
        r: false,
        t: { limit: { tif: "Gtc" } },
      }],
      grouping: "na",
    });

    // —————————— Test ——————————

    try {
      const data = await Promise.all([
        clients.exchange.updateIsolatedMargin({ asset: id, isBuy: true, ntli: 1 }),
      ]);
      schemaCoverage(SuccessResponse, data);
    } finally {
      // —————————— Cleanup ——————————

      await clients.exchange.order({
        orders: [{
          a: id,
          b: false,
          p: pxDown,
          s: "0", // full position size
          r: true,
          t: { limit: { tif: "Gtc" } },
        }],
        grouping: "na",
      });
    }
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "updateIsolatedMargin",
      "--asset",
      "0",
      "--isBuy",
      "true",
      "--ntli",
      "1",
    ]);
    parser(UpdateIsolatedMarginRequest)(JSON.parse(data));
  },
});
