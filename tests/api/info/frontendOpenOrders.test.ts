import * as v from "@valibot/valibot";
import { FrontendOpenOrdersRequest, FrontendOpenOrdersResponse } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";

runTest({
  name: "frontendOpenOrders",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.frontendOpenOrders({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }),
    ]);
    schemaCoverage(FrontendOpenOrdersResponse, data, {
      ignorePicklistValues: {
        "#/items/properties/orderType": ["Market", "Take Profit Market", "Take Profit Limit"],
        "#/items/properties/tif/wrapped": ["Ioc", "FrontendMarket", "LiquidationMarket"],
      },
    });
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "frontendOpenOrders",
      "--user=0x563C175E6f11582f65D6d9E360A618699DEe14a9",
    ]);
    v.parse(FrontendOpenOrdersRequest, data);
  },
});
