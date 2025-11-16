import { OpenOrdersEvent } from "../../../src/api/subscription/~mod.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { collectEventsOverTime, runTest } from "./_t.ts";

runTest({
  name: "openOrders",
  mode: "api",
  fn: async (_t, client) => {
    const data = await Promise.all([
      collectEventsOverTime<OpenOrdersEvent>(
        async (cb) => {
          await client.openOrders({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }, cb);
        },
        10_000,
      ),
    ]);
    schemaCoverage(OpenOrdersEvent, data.flat(), {
      ignoreBranches: {
        "#/properties/orders/items/properties/orderType": [0, 4, 5],
        "#/properties/orders/items/properties/tif/wrapped": [1, 3, 4],
      },
    });
  },
});
