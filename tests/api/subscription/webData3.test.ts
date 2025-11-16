import { WebData3Event } from "../../../src/api/subscription/~mod.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { collectEventsOverTime, runTest } from "./_t.ts";

runTest({
  name: "webData3",
  mode: "api",
  fn: async (_t, client) => {
    const data = await Promise.all([
      collectEventsOverTime<WebData3Event>(
        async (cb) => {
          await client.webData3({ user: "0x0000000000000000000000000000000000000000" }, cb);
        },
        10_000,
      ),
      collectEventsOverTime<WebData3Event>(
        async (cb) => {
          await client.webData3({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }, cb);
        },
        10_000,
      ),
      collectEventsOverTime<WebData3Event>(
        async (cb) => {
          await client.webData3({ user: "0xe019d6167E7e324aEd003d94098496b6d986aB05" }, cb);
        },
        10_000,
      ),
    ]);
    schemaCoverage(WebData3Event, data.flat(), {
      ignoreBranches: {
        "#/properties/perpDexStates/items/properties/openOrders/items/properties/orderType": [0, 4, 5],
        "#/properties/perpDexStates/items/properties/openOrders/items/properties/tif/wrapped": [1, 3, 4],
      },
    });
  },
});
