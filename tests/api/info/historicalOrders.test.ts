import * as v from "@valibot/valibot";
import { HistoricalOrdersRequest, HistoricalOrdersResponse } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverageHyperliquid.ts";

runTest({
  name: "historicalOrders",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.historicalOrders({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }),
    ]);
    schemaCoverage(HistoricalOrdersResponse, data, [
      "#/items/properties/status/picklist/5",
      "#/items/properties/status/picklist/6",
      "#/items/properties/status/picklist/7",
      "#/items/properties/status/picklist/8",
      "#/items/properties/status/picklist/10",
      "#/items/properties/status/picklist/11",
      "#/items/properties/status/picklist/12",
      "#/items/properties/status/picklist/13",
      "#/items/properties/status/picklist/14",
      "#/items/properties/status/picklist/15",
      "#/items/properties/status/picklist/16",
      "#/items/properties/status/picklist/17",
      "#/items/properties/status/picklist/18",
      "#/items/properties/status/picklist/19",
      "#/items/properties/status/picklist/20",
      "#/items/properties/status/picklist/21",
      "#/items/properties/status/picklist/22",
      "#/items/properties/status/picklist/23",
      "#/items/properties/status/picklist/24",
      "#/items/properties/status/picklist/25",
      "#/items/properties/status/picklist/26",
      "#/items/properties/status/picklist/27",
      "#/items/properties/status/picklist/28",
    ]);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "historicalOrders",
      "--user=0x563C175E6f11582f65D6d9E360A618699DEe14a9",
    ]);
    v.parse(HistoricalOrdersRequest, data);
  },
});
