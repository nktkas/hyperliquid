// deno-lint-ignore-file no-import-prefix
import { ModifyRequest, parser, SuccessResponse } from "@nktkas/hyperliquid/api/exchange";
import { BigNumber } from "npm:bignumber.js@9";
import { getWalletAddress } from "@nktkas/hyperliquid/signing";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { formatPrice, formatSize, getAssetData, randomCloid, runTest } from "./_t.ts";

runTest({
  name: "modify",
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
    const pxDown = formatPrice(new BigNumber(ctx.markPx).times(0.99), universe.szDecimals);
    const sz = formatSize(new BigNumber(15).div(ctx.markPx), universe.szDecimals);

    // —————————— Test ——————————

    try {
      const data = await Promise.all([
        clients.exchange.modify({
          oid: (await openOrder(id, pxDown, sz)).oid,
          order: {
            a: id,
            b: true,
            p: pxDown,
            s: sz,
            r: false,
            t: { limit: { tif: "Gtc" } },
          },
        }),
      ]);
      schemaCoverage(SuccessResponse, data);
    } finally {
      // —————————— Cleanup ——————————

      const openOrders = await clients.info.openOrders({ user: await getWalletAddress(clients.exchange.wallet) });
      const cancels = openOrders.map((o) => ({ a: id, o: o.oid }));
      await clients.exchange.cancel({ cancels });
    }
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "modify",
      "--oid",
      "0",
      "--order",
      JSON.stringify({
        a: 0,
        b: true,
        p: "1",
        s: "1",
        r: false,
        t: { limit: { tif: "Gtc" } },
      }),
    ]);
    parser(ModifyRequest)(JSON.parse(data));
  },
});
