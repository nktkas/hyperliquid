import type { OpenOrdersEvent } from "@nktkas/hyperliquid/api/subscription";
import { collectEventsOverTime, runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/subscription/_methods/openOrders.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "OpenOrdersEvent");

runTest({
  name: "openOrders",
  mode: "api",
  fn: async (_t, client) => {
    const data = await collectEventsOverTime<OpenOrdersEvent>(async (cb) => {
      await client.openOrders({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }, cb);
    }, 10_000);
    schemaCoverage(typeSchema, data, [
      "#/properties/orders/items/properties/orderType/enum/0",
      "#/properties/orders/items/properties/orderType/enum/4",
      "#/properties/orders/items/properties/orderType/enum/5",
      "#/properties/orders/items/properties/tif/enum/1",
      "#/properties/orders/items/properties/tif/enum/3",
      "#/properties/orders/items/properties/tif/enum/4",
      "#/properties/orders/items/properties/tif/enum/5",
      "#/properties/orders/items/properties/cloid/defined",
    ]);
  },
});
