// deno-lint-ignore-file no-import-prefix
import { CancelRequest, CancelSuccessResponse, parser } from "@nktkas/hyperliquid/api/exchange";
import { BigNumber } from "npm:bignumber.js@9";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { formatPrice, formatSize, getAssetData, runTest } from "./_t.ts";

runTest({
  name: "cancel",
  topup: { perp: "15" },
  codeTestFn: async (_t, clients) => {
    // —————————— Prepare ——————————

    async function openOrder(id: number, pxDown: string, sz: string) {
      await clients.exchange.updateLeverage({ asset: id, isCross: true, leverage: 3 });
      const openOrderRes = await clients.exchange.order({
        orders: [{
          a: id,
          b: true,
          p: pxDown,
          s: sz,
          r: false,
          t: { limit: { tif: "Gtc" } },
        }],
        grouping: "na",
      });
      const [order] = openOrderRes.response.data.statuses;
      return "resting" in order ? order.resting.oid : order.filled.oid;
    }

    const { id, universe, ctx } = await getAssetData("BTC");
    const pxDown = formatPrice(new BigNumber(ctx.markPx).times(0.99), universe.szDecimals);
    const sz = formatSize(new BigNumber(11).div(ctx.markPx), universe.szDecimals);

    // —————————— Test ——————————

    const data = await Promise.all([
      clients.exchange.cancel({
        cancels: [{
          a: id,
          o: await openOrder(id, pxDown, sz),
        }],
      }),
    ]);
    schemaCoverage(CancelSuccessResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "cancel",
      "--cancels",
      JSON.stringify([{ a: 0, o: 0 }]),
    ]);
    parser(CancelRequest)(JSON.parse(data));
  },
});
