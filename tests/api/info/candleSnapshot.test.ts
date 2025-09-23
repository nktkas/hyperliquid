import { CandleSnapshotRequest, CandleSnapshotResponse, parser } from "@nktkas/hyperliquid/api/info";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "candleSnapshot",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.candleSnapshot({ coin: "ETH", interval: "15m", startTime: Date.now() - 1000 * 60 * 60 * 24 }),
    ]);
    schemaCoverage(CandleSnapshotResponse, data, {
      ignoreBranches: {
        "#/items/properties/i": [0, 1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
      },
    });
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "candleSnapshot",
      "--coin",
      "ETH",
      "--interval",
      "15m",
      "--startTime",
      "1757440693681",
    ]);
    parser(CandleSnapshotRequest)(JSON.parse(data));
  },
});
