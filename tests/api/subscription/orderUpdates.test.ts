import { OrderUpdatesEvent } from "@nktkas/hyperliquid/api/subscription";
import { getWalletAddress } from "@nktkas/hyperliquid/signing";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { collectEventsOverTime, openOrder, runTestWithExchange } from "./_t.ts";

runTestWithExchange({
  name: "orderUpdates",
  fn: async (_t, client) => {
    const data = await Promise.all([
      collectEventsOverTime<OrderUpdatesEvent>(
        async (cb) => {
          const user = await getWalletAddress(client.exch.wallet);
          await client.subs.orderUpdates({ user }, cb);
          await openOrder(client.exch, "limit");
        },
        10_000,
      ),
    ]);
    schemaCoverage(OrderUpdatesEvent, data.flat(), {
      ignoreBranches: {
        "#/items/properties/order/properties/side": [1],
        "#/items/properties/status": [
          1,
          2,
          3,
          4,
          5,
          6,
          7,
          8,
          9,
          10,
          11,
          12,
          13,
          14,
          15,
          16,
          17,
          18,
          19,
          20,
          21,
          22,
          23,
          24,
          25,
          26,
          27,
          28,
        ],
      },
      ignoreDefinedTypes: [
        "#/items/properties/order/properties/cloid",
        "#/items/properties/order/properties/reduceOnly",
      ],
      ignoreUndefinedTypes: [
        "#/items/properties/order/properties/cloid",
      ],
    });
  },
});
