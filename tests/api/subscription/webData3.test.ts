import { WebData3Event } from "@nktkas/hyperliquid/api/subscription";
import { collectEventsOverTime, runTest } from "./_t.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";

runTest({
  name: "webData3",
  mode: "api",
  fn: async (_t, client) => {
    const data = await collectEventsOverTime<WebData3Event>(async (cb) => {
      await client.webData3({ user: "0x0000000000000000000000000000000000000000" }, cb);
      await client.webData3({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }, cb);
      await client.webData3({ user: "0xe019d6167E7e324aEd003d94098496b6d986aB05" }, cb);
    }, 10_000);
    schemaCoverage(WebData3Event, data.flat(), {
      ignoreDefinedTypes: [
        "#/properties/userState/properties/agentAddress",
        "#/properties/userState/properties/agentValidUntil",
      ],
      ignorePicklistValues: {
        "#/properties/perpDexStates/items/properties/openOrders/items/properties/orderType": [
          "Market",
          "Take Profit Market",
          "Take Profit Limit",
        ],
        "#/properties/perpDexStates/items/properties/openOrders/items/properties/tif/wrapped": [
          "Ioc",
          "FrontendMarket",
          "LiquidationMarket",
        ],
      },
    });
  },
});
