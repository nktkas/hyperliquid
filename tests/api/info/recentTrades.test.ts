import { parser, RecentTradesRequest, RecentTradesResponse } from "@nktkas/hyperliquid/api/info";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "recentTrades",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.recentTrades({ coin: "ETH" }),
    ]);
    schemaCoverage(RecentTradesResponse, data, {
      ignoreBranches: {
        "#/items/properties/side": [0, 1],
      },
    });
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["info", "recentTrades", "--coin", "ETH"]);
    parser(RecentTradesRequest)(JSON.parse(data));
  },
});
