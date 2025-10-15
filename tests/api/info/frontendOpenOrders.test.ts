import { FrontendOpenOrdersRequest, FrontendOpenOrdersResponse, parser } from "@nktkas/hyperliquid/api/info";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "frontendOpenOrders",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.frontendOpenOrders({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }),
    ]);
    schemaCoverage(FrontendOpenOrdersResponse, data, {
      ignoreBranches: {
        "#/items/properties/orderType": [0, 4, 5],
        "#/items/properties/tif/wrapped": [1, 3, 4],
      },
    });
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "frontendOpenOrders",
      "--user",
      "0x563C175E6f11582f65D6d9E360A618699DEe14a9",
    ]);
    parser(FrontendOpenOrdersRequest)(JSON.parse(data));
  },
});
