import { UserHistoricalOrdersEvent } from "@nktkas/hyperliquid/api/subscription";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { collectEventsOverTime, runTest } from "./_t.ts";

runTest({
  name: "userHistoricalOrders",
  mode: "api",
  fn: async (_t, client) => {
    const data = await Promise.all([
      collectEventsOverTime<UserHistoricalOrdersEvent>(
        async (cb) => {
          await client.userHistoricalOrders({ user: "0xe019d6167E7e324aEd003d94098496b6d986aB05" }, cb);
        },
        10_000,
      ),
    ]);
    schemaCoverage(UserHistoricalOrdersEvent, data.flat(), {
      ignoreEmptyArray: ["#/properties/orderHistory/items/properties/order/properties/children"],
      ignoreBranches: {
        "#/properties/orderHistory/items/properties/order/properties/orderType": [2, 3, 4, 5],
        "#/properties/orderHistory/items/properties/order/properties/tif/wrapped": [1, 2, 4],
        "#/properties/orderHistory/items/properties/status": [
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
      ignoreUndefinedTypes: ["#/properties/isSnapshot"],
      ignoreNullTypes: [
        "#/properties/orderHistory/items/properties/order/properties/tif",
      ],
      ignoreDefinedTypes: [
        "#/properties/orderHistory/items/properties/order/properties/cloid",
      ],
    });
  },
});
