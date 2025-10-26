// deno-lint-ignore-file no-import-prefix
import { OrderUpdatesEvent } from "@nktkas/hyperliquid/api/subscription";
import { deadline } from "jsr:@std/async@1/deadline";
import { getWalletAddress } from "@nktkas/hyperliquid/signing";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { openOrder, runTestWithExchange } from "./_t.ts";

runTestWithExchange({
  name: "orderUpdates",
  fn: async (_t, client) => {
    const data = await Promise.all([
      deadline(
        // deno-lint-ignore no-async-promise-executor
        new Promise<OrderUpdatesEvent[]>(async (resolve, reject) => {
          const events: OrderUpdatesEvent[] = [];
          await client.subs.orderUpdates({
            user: await getWalletAddress(client.exch.wallet),
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

          const orderPromise = openOrder(client.exch, "limit");
        }),
        20_000,
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
