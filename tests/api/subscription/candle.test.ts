import { CandleEvent } from "@nktkas/hyperliquid/api/subscription";
import { collectEventsOverTime, runTest } from "./_t.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";

runTest({
  name: "candle",
  mode: "api",
  fn: async (_t, client) => {
    const data = await collectEventsOverTime<CandleEvent>(async (cb) => {
      await client.candle({ coin: "BTC", interval: "1m" }, cb);
      await client.candle({ coin: "ETH", interval: "1m" }, cb);
      await client.candle({ coin: "SOL", interval: "1m" }, cb);
    }, 60_000);
    schemaCoverage(CandleEvent, data, {
      ignorePicklistValues: {
        "#/properties/i": [
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
});
