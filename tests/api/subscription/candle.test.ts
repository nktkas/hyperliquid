import { CandleEvent } from "@nktkas/hyperliquid/api/subscription";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { collectEventsOverTime, runTest } from "./_t.ts";

runTest({
  name: "candle",
  mode: "api",
  fn: async (_t, client) => {
    const data = await Promise.all([
      collectEventsOverTime<CandleEvent>(
        async (cb) => {
          await client.candle({ coin: "BTC", interval: "1m" }, cb);
        },
        60_000,
      ),
      collectEventsOverTime<CandleEvent>(
        async (cb) => {
          await client.candle({ coin: "ETH", interval: "1m" }, cb);
        },
        60_000,
      ),
      collectEventsOverTime<CandleEvent>(
        async (cb) => {
          await client.candle({ coin: "SOL", interval: "1m" }, cb);
        },
        60_000,
      ),
    ]);
    schemaCoverage(CandleEvent, data.flat(), {
      ignoreBranches: {
        "#/properties/i": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
      },
    });
  },
});
