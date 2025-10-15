// deno-lint-ignore-file no-import-prefix
import { UserHistoricalOrdersEvent } from "@nktkas/hyperliquid/api/subscription";
import { deadline } from "jsr:@std/async@1/deadline";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest("userHistoricalOrders", "api", async (_t, client) => {
  const data = await Promise.all([
    deadline(
      new Promise<UserHistoricalOrdersEvent>((resolve) => {
        client.userHistoricalOrders({ user: "0xe019d6167E7e324aEd003d94098496b6d986aB05" }, resolve);
      }),
      10_000,
    ),
  ]);
  schemaCoverage(UserHistoricalOrdersEvent, data, {
    ignoreEmptyArray: ["#/properties/orderHistory/items/properties/order/properties/children"],
    ignoreBranches: {
      "#/properties/orderHistory/items/properties/order/properties/orderType": [4, 5],
      "#/properties/orderHistory/items/properties/order/properties/tif/wrapped": [4],
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
        28,
      ],
    },
    ignoreUndefinedTypes: ["#/properties/isSnapshot"],
  });
});
