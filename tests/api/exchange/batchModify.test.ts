// deno-lint-ignore-file no-import-prefix
import { BatchModifyRequest, OrderSuccessResponse, parser } from "@nktkas/hyperliquid/api/exchange";
import { BigNumber } from "npm:bignumber.js@9";
import { getWalletAddress } from "@nktkas/hyperliquid/signing";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { formatPrice, formatSize, getAssetData, randomCloid, runTest } from "./_t.ts";

runTest({
  name: "batchModify",
  topup: { perp: "15" },
  codeTestFn: async (_t, clients) => {
    // —————————— Prepare ——————————

    async function openOrder(id: number, pxDown: string, sz: string) {
      const cloid = randomCloid();
      const orderResp = await clients.exchange.order({
        orders: [{
          a: id,
          b: true,
          p: pxDown,
          s: sz,
          r: false,
          t: { limit: { tif: "Gtc" } },
          c: cloid,
        }],
        grouping: "na",
      });
      const [order] = orderResp.response.data.statuses;
      return {
        oid: "resting" in order ? order.resting.oid : order.filled.oid,
        cloid: "resting" in order ? order.resting.cloid! : order.filled.cloid!,
      };
    }

    const { id, universe, ctx } = await getAssetData("SOL");
    const pxUp = formatPrice(new BigNumber(ctx.markPx).times(1.01), universe.szDecimals);
    const pxDown = formatPrice(new BigNumber(ctx.markPx).times(0.99), universe.szDecimals);
    const sz = formatSize(new BigNumber("13").div(ctx.markPx), universe.szDecimals);

    // —————————— Test ——————————

    try {
      const data = await Promise.all([
        // resting
        clients.exchange.batchModify({
          modifies: [{
            oid: (await openOrder(id, pxDown, sz)).oid,
            order: {
              a: id,
              b: true,
              p: pxDown,
              s: sz,
              r: false,
              t: { limit: { tif: "Gtc" } },
            },
          }],
        }),
        // resting | cloid
        clients.exchange.batchModify({
          modifies: [{
            oid: (await openOrder(id, pxDown, sz)).cloid,
            order: {
              a: id,
              b: true,
              p: pxDown,
              s: sz,
              r: false,
              t: { limit: { tif: "Gtc" } },
              c: randomCloid(),
            },
          }],
        }),
        // filled
        clients.exchange.batchModify({
          modifies: [{
            oid: (await openOrder(id, pxDown, sz)).cloid,
            order: {
              a: id,
              b: true,
              p: pxUp,
              s: sz,
              r: false,
              t: { limit: { tif: "Gtc" } },
            },
          }],
        }),
        // filled | cloid
        clients.exchange.batchModify({
          modifies: [{
            oid: (await openOrder(id, pxDown, sz)).oid,
            order: {
              a: id,
              b: true,
              p: pxUp,
              s: sz,
              r: false,
              t: { limit: { tif: "Gtc" } },
              c: randomCloid(),
            },
          }],
        }),
      ]);
      schemaCoverage(OrderSuccessResponse, data);
    } finally {
      // —————————— Cleanup ——————————

      const openOrders = await clients.info.openOrders({ user: await getWalletAddress(clients.exchange.wallet) });
      const cancels = openOrders.map((o) => ({ a: id, o: o.oid }));
      await clients.exchange.cancel({ cancels });
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
      "batchModify",
      "--modifies",
      JSON.stringify([
        { oid: 12345, order: { a: 0, b: true, p: "1", s: "1", r: false, t: { limit: { tif: "Gtc" } } } },
        { oid: 12346, order: { a: 1, b: false, p: "2", s: "2", r: true, t: { limit: { tif: "Alo" } } } },
      ]),
    ]);
    parser(BatchModifyRequest)(JSON.parse(data));
  },
});
