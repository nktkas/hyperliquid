import type { UserHistoricalOrdersEvent } from "@nktkas/hyperliquid/api/subscription";
import { collectEventsOverTime, runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/subscription/_methods/userHistoricalOrders.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "UserHistoricalOrdersEvent");

runTest({
  name: "userHistoricalOrders",
  mode: "api",
  fn: async (_t, client) => {
    const data = await collectEventsOverTime<UserHistoricalOrdersEvent>(async (cb) => {
      await client.userHistoricalOrders({ user: "0xe019d6167E7e324aEd003d94098496b6d986aB05" }, cb);
      await client.userHistoricalOrders({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }, cb);
    }, 10_000);
    schemaCoverage(typeSchema, data, [
      "#/properties/orderHistory/items/properties/order/properties/orderType/enum/3",
      "#/properties/orderHistory/items/properties/order/properties/tif/enum/5",
      "#/properties/orderHistory/items/properties/status/enum/4",
      "#/properties/orderHistory/items/properties/status/enum/5",
      "#/properties/orderHistory/items/properties/status/enum/6",
      "#/properties/orderHistory/items/properties/status/enum/7",
      "#/properties/orderHistory/items/properties/status/enum/8",
      "#/properties/orderHistory/items/properties/status/enum/10",
      "#/properties/orderHistory/items/properties/status/enum/11",
      "#/properties/orderHistory/items/properties/status/enum/12",
      "#/properties/orderHistory/items/properties/status/enum/13",
      "#/properties/orderHistory/items/properties/status/enum/14",
      "#/properties/orderHistory/items/properties/status/enum/16",
      "#/properties/orderHistory/items/properties/status/enum/17",
      "#/properties/orderHistory/items/properties/status/enum/18",
      "#/properties/orderHistory/items/properties/status/enum/19",
      "#/properties/orderHistory/items/properties/status/enum/20",
      "#/properties/orderHistory/items/properties/status/enum/21",
      "#/properties/orderHistory/items/properties/status/enum/22",
      "#/properties/orderHistory/items/properties/status/enum/23",
      "#/properties/orderHistory/items/properties/status/enum/24",
      "#/properties/orderHistory/items/properties/status/enum/26",
      "#/properties/orderHistory/items/properties/status/enum/27",
      "#/properties/orderHistory/items/properties/status/enum/28",
      "#/properties/isSnapshot/missing",
    ]);
  },
});
