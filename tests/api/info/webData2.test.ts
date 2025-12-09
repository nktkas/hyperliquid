import * as v from "@valibot/valibot";
import { WebData2Request, WebData2Response } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";

runTest({
  name: "webData2",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.webData2({ user: "0x0000000000000000000000000000000000000000" }),
      client.webData2({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }),
      client.webData2({ user: "0xe019d6167E7e324aEd003d94098496b6d986aB05" }),
      client.webData2({ user: "0x1defed46db35334232b9f5fd2e5c6180276fb99d" }),
    ]);
    schemaCoverage(WebData2Response, data, {
      ignoreDefinedTypes: [
        "#/properties/meta/properties/universe/items/properties/growthMode",
        "#/properties/meta/properties/universe/items/properties/lastGrowthModeChangeTime",
        "#/properties/agentAddress",
        "#/properties/agentValidUntil",
        "#/properties/perpsAtOpenInterestCap",
      ],
      ignorePicklistValues: {
        "#/properties/openOrders/items/properties/orderType": ["Market", "Take Profit Market", "Take Profit Limit"],
        "#/properties/openOrders/items/properties/tif/wrapped": ["Ioc", "FrontendMarket", "LiquidationMarket"],
        "#/properties/meta/properties/universe/items/properties/marginMode": ["strictIsolated", "noCross"],
      },
      ignoreEmptyArray: [
        "#/properties/twapStates",
      ],
    });
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "webData2",
      "--user=0x563C175E6f11582f65D6d9E360A618699DEe14a9",
    ]);
    v.parse(WebData2Request, data);
  },
});
