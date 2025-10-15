import { HistoricalOrdersRequest, HistoricalOrdersResponse, parser } from "@nktkas/hyperliquid/api/info";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "historicalOrders",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.historicalOrders({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }),
    ]);
    schemaCoverage(HistoricalOrdersResponse, data, {
      ignoreBranches: {
        "#/items/properties/status": [
          5,
          6,
          7,
          8,
          10,
          11,
          12,
          13,
          14,
          15,
          16,
          17,
          18,
          19,
          20,
          21,
          22,
          23,
          24,
          25,
          26,
          27,
          28,
        ],
      },
    });
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "historicalOrders",
      "--user",
      "0x563C175E6f11582f65D6d9E360A618699DEe14a9",
    ]);
    parser(HistoricalOrdersRequest)(JSON.parse(data));
  },
});
