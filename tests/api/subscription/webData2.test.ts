import { WebData2Event } from "@nktkas/hyperliquid/api/subscription";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { collectEventsOverTime, runTest } from "./_t.ts";

runTest({
  name: "webData2",
  mode: "api",
  fn: async (_t, client) => {
    const data = await Promise.all([
      collectEventsOverTime<WebData2Event>(
        async (cb) => {
          await client.webData2({ user: "0x0000000000000000000000000000000000000000" }, cb);
        },
        10_000,
      ),
      collectEventsOverTime<WebData2Event>(
        async (cb) => {
          await client.webData2({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }, cb);
        },
        10_000,
      ),
      collectEventsOverTime<WebData2Event>(
        async (cb) => {
          await client.webData2({ user: "0xe019d6167E7e324aEd003d94098496b6d986aB05" }, cb);
        },
        10_000,
      ),
      collectEventsOverTime<WebData2Event>(
        async (cb) => {
          await client.webData2({ user: "0x1defed46db35334232b9f5fd2e5c6180276fb99d" }, cb);
        },
        10_000,
      ),
    ]);
    schemaCoverage(WebData2Event, data.flat(), {
      ignoreBranches: {
        "#/properties/openOrders/items/properties/orderType": [0, 4, 5],
        "#/properties/openOrders/items/properties/tif/wrapped": [1, 3, 4],
        "#/properties/meta/properties/universe/items/properties/marginMode": [1],
      },
      ignoreEmptyArray: [
        "#/properties/twapStates",
      ],
      ignoreUndefinedTypes: [
        "#/properties/perpsAtOpenInterestCap",
      ],
    });
  },
});
