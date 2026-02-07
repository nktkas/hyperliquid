import type { WebData2Event } from "@nktkas/hyperliquid/api/subscription";
import { collectEventsOverTime, runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/subscription/_methods/webData2.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "WebData2Event");

runTest({
  name: "webData2",
  mode: "api",
  fn: async (_t, client) => {
    const data = await collectEventsOverTime<WebData2Event>(async (cb) => {
      await client.webData2({ user: "0x0000000000000000000000000000000000000000" }, cb);
      await client.webData2({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }, cb);
      await client.webData2({ user: "0xe019d6167E7e324aEd003d94098496b6d986aB05" }, cb);
      await client.webData2({ user: "0x1defed46db35334232b9f5fd2e5c6180276fb99d" }, cb);
    }, 10_000);
    schemaCoverage(typeSchema, data, [
      "#/properties/openOrders/items/properties/orderType/enum/0",
      "#/properties/openOrders/items/properties/orderType/enum/4",
      "#/properties/openOrders/items/properties/orderType/enum/5",
      "#/properties/openOrders/items/properties/tif/enum/1",
      "#/properties/openOrders/items/properties/tif/enum/3",
      "#/properties/openOrders/items/properties/tif/enum/4",
      "#/properties/openOrders/items/properties/tif/enum/5",
      "#/properties/openOrders/items/properties/cloid/defined",
      "#/properties/meta/properties/universe/items/properties/marginMode/enum/1",
      "#/properties/meta/properties/universe/items/properties/growthMode/present",
      "#/properties/meta/properties/universe/items/properties/lastGrowthModeChangeTime/present",
      "#/properties/twapStates/array",
      "#/properties/perpsAtOpenInterestCap/present",
    ]);
  },
});
