import * as v from "@valibot/valibot";
import { FrontendOpenOrdersRequest, FrontendOpenOrdersResponse } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverageHyperliquid.ts";

runTest({
  name: "frontendOpenOrders",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.frontendOpenOrders({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }),
    ]);
    schemaCoverage(FrontendOpenOrdersResponse, data, [
      "#/items/properties/orderType/picklist/0",
      "#/items/properties/orderType/picklist/4",
      "#/items/properties/orderType/picklist/5",
      "#/items/properties/tif/wrapped/picklist/1",
      "#/items/properties/tif/wrapped/picklist/3",
      "#/items/properties/tif/wrapped/picklist/4",
      "#/items/properties/cloid/defined",
    ]);
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
