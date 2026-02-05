import { OpenOrdersEvent } from "@nktkas/hyperliquid/api/subscription";
import { collectEventsOverTime, runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverageHyperliquid.ts";

runTest({
  name: "openOrders",
  mode: "api",
  fn: async (_t, client) => {
    const data = await collectEventsOverTime<OpenOrdersEvent>(async (cb) => {
      await client.openOrders({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }, cb);
    }, 10_000);
    schemaCoverage(OpenOrdersEvent, data, [
      "#/properties/orders/items/properties/orderType/picklist/0",
      "#/properties/orders/items/properties/orderType/picklist/4",
      "#/properties/orders/items/properties/orderType/picklist/5",
      "#/properties/orders/items/properties/tif/wrapped/picklist/1",
      "#/properties/orders/items/properties/tif/wrapped/picklist/3",
      "#/properties/orders/items/properties/tif/wrapped/picklist/4",
    ]);
  },
});
