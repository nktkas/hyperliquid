import { WebData2Event } from "@nktkas/hyperliquid/api/subscription";
import { collectEventsOverTime, runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverageHyperliquid.ts";

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
    schemaCoverage(WebData2Event, data, [
      "#/properties/openOrders/items/properties/orderType/picklist/0",
      "#/properties/openOrders/items/properties/orderType/picklist/4",
      "#/properties/openOrders/items/properties/orderType/picklist/5",
      "#/properties/openOrders/items/properties/tif/wrapped/picklist/1",
      "#/properties/openOrders/items/properties/tif/wrapped/picklist/3",
      "#/properties/openOrders/items/properties/tif/wrapped/picklist/4",
      "#/properties/agentAddress/defined",
      "#/properties/agentValidUntil/defined",
      "#/properties/meta/properties/universe/items/properties/marginMode/picklist/1",
      "#/properties/meta/properties/universe/items/properties/growthMode/defined",
      "#/properties/meta/properties/universe/items/properties/lastGrowthModeChangeTime/defined",
      "#/properties/twapStates/array",
      "#/properties/perpsAtOpenInterestCap/defined",
    ]);
  },
});
