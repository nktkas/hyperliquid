import * as v from "@valibot/valibot";
import { RecentTradesRequest, RecentTradesResponse } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";

runTest({
  name: "recentTrades",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.recentTrades({ coin: "ETH" }),
    ]);
    schemaCoverage(RecentTradesResponse, data, {
      ignorePicklistValues: {
        "#/items/properties/side": ["A", "B"],
      },
    });
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "recentTrades",
      "--coin=ETH",
    ]);
    v.parse(RecentTradesRequest, data);
  },
});
