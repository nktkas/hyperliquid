import * as v from "@valibot/valibot";
import { CandleSnapshotRequest, CandleSnapshotResponse } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";

runTest({
  name: "candleSnapshot",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.candleSnapshot({ coin: "ETH", interval: "15m", startTime: Date.now() - 1000 * 60 * 60 * 24 }),
    ]);
    schemaCoverage(CandleSnapshotResponse, data, {
      ignorePicklistValues: {
        "#/items/properties/i": [
          "1m",
          "3m",
          "5m",
          "15m",
          "30m",
          "1h",
          "2h",
          "4h",
          "6h",
          "8h",
          "12h",
          "1d",
          "3d",
          "1w",
          "1M",
        ],
      },
    });
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "candleSnapshot",
      "--coin=ETH",
      "--interval=15m",
      "--startTime=1757440693681",
    ]);
    v.parse(CandleSnapshotRequest, data);
  },
});
