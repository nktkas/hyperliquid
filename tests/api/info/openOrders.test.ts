import * as v from "@valibot/valibot";
import { OpenOrdersRequest, OpenOrdersResponse } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";

runTest({
  name: "openOrders",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.openOrders({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }),
    ]);
    schemaCoverage(OpenOrdersResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "openOrders",
      "--user=0x563C175E6f11582f65D6d9E360A618699DEe14a9",
    ]);
    v.parse(OpenOrdersRequest, data);
  },
});
