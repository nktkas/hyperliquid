// deno-lint-ignore-file no-import-prefix
import { OrderUpdatesEvent } from "@nktkas/hyperliquid/api/subscription";
import { deadline } from "jsr:@std/async@1/deadline";
import { getWalletAddress } from "@nktkas/hyperliquid/signing";
import { BigNumber } from "npm:bignumber.js@9";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { formatPrice, formatSize, getAssetData, runTestWithExchange } from "./_t.ts";

runTestWithExchange("orderUpdates", async (_t, clients) => {
  // —————————— Prepare ——————————

  async function openCancelOrder(asset: string): Promise<void> {
    const { id, universe, ctx } = await getAssetData(asset);
    const pxDown = formatPrice(new BigNumber(ctx.markPx).times(0.99), universe.szDecimals);
    const sz = formatSize(new BigNumber(15).div(ctx.markPx), universe.szDecimals);

    const openOrder = await clients.exchange.order({
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

    const [order] = openOrder.response.data.statuses;
    await clients.exchange.cancel({
      cancels: [{
        a: id,
        o: "resting" in order ? order.resting.oid : order.filled.oid,
      }],
    });
  }

  // —————————— Test ——————————

  const data = await Promise.all([
    deadline(
      // deno-lint-ignore no-async-promise-executor
      new Promise<OrderUpdatesEvent[]>(async (resolve, reject) => {
        const events: OrderUpdatesEvent[] = [];
        await clients.subs.orderUpdates({
          user: await getWalletAddress(clients.exchange.wallet),
        }, async (data) => {
          try {
            events.push(data);
            if (events.length === 1) { // Only first event should trigger promise
              await orderPromise;
              await new Promise((r) => setTimeout(r, 3000));
              resolve(events);
            }
          } catch (error) {
            reject(error);
          }
        });

        const orderPromise = openCancelOrder("ETH");
      }),
      20_000,
    ),
  ]);
  schemaCoverage(OrderUpdatesEvent, data.flat(), {
    ignoreBranches: {
      "#/items/properties/order/properties/side": [1],
      "#/items/properties/status": [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    },
    ignoreDefinedTypes: [
      "#/items/properties/order/properties/cloid",
      "#/items/properties/order/properties/reduceOnly",
    ],
  });
});
