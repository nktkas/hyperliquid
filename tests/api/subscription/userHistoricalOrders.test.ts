import { UserHistoricalOrdersEvent } from "@nktkas/hyperliquid/api/subscription";
import { collectEventsOverTime, runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverageHyperliquid.ts";

runTest({
  name: "userHistoricalOrders",
  mode: "api",
  fn: async (_t, client) => {
    const data = await collectEventsOverTime<UserHistoricalOrdersEvent>(async (cb) => {
      await client.userHistoricalOrders({ user: "0xe019d6167E7e324aEd003d94098496b6d986aB05" }, cb);
      await client.userHistoricalOrders({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }, cb);
    }, 10_000);
    schemaCoverage(UserHistoricalOrdersEvent, data, [
      "#/properties/orderHistory/items/properties/order/properties/orderType/picklist/3",
      "#/properties/orderHistory/items/properties/status/picklist/5",
      "#/properties/orderHistory/items/properties/status/picklist/6",
      "#/properties/orderHistory/items/properties/status/picklist/7",
      "#/properties/orderHistory/items/properties/status/picklist/8",
      "#/properties/orderHistory/items/properties/status/picklist/10",
      "#/properties/orderHistory/items/properties/status/picklist/11",
      "#/properties/orderHistory/items/properties/status/picklist/12",
      "#/properties/orderHistory/items/properties/status/picklist/13",
      "#/properties/orderHistory/items/properties/status/picklist/14",
      "#/properties/orderHistory/items/properties/status/picklist/16",
      "#/properties/orderHistory/items/properties/status/picklist/17",
      "#/properties/orderHistory/items/properties/status/picklist/18",
      "#/properties/orderHistory/items/properties/status/picklist/19",
      "#/properties/orderHistory/items/properties/status/picklist/20",
      "#/properties/orderHistory/items/properties/status/picklist/21",
      "#/properties/orderHistory/items/properties/status/picklist/22",
      "#/properties/orderHistory/items/properties/status/picklist/23",
      "#/properties/orderHistory/items/properties/status/picklist/24",
      "#/properties/orderHistory/items/properties/status/picklist/26",
      "#/properties/orderHistory/items/properties/status/picklist/27",
      "#/properties/orderHistory/items/properties/status/picklist/28",
      "#/properties/isSnapshot/undefined",
    ]);
  },
});
