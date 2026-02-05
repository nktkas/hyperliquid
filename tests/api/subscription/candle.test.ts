import { CandleEvent } from "@nktkas/hyperliquid/api/subscription";
import { collectEventsOverTime, runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverageHyperliquid.ts";

runTest({
  name: "candle",
  mode: "api",
  fn: async (_t, client) => {
    const data = await collectEventsOverTime<CandleEvent>(async (cb) => {
      await client.candle({ coin: "BTC", interval: "1m" }, cb);
      await client.candle({ coin: "ETH", interval: "1m" }, cb);
      await client.candle({ coin: "SOL", interval: "1m" }, cb);
    }, 60_000);
    schemaCoverage(CandleEvent, data, [
      "#/properties/i/picklist/1",
      "#/properties/i/picklist/2",
      "#/properties/i/picklist/3",
      "#/properties/i/picklist/4",
      "#/properties/i/picklist/5",
      "#/properties/i/picklist/6",
      "#/properties/i/picklist/7",
      "#/properties/i/picklist/8",
      "#/properties/i/picklist/9",
      "#/properties/i/picklist/10",
      "#/properties/i/picklist/11",
      "#/properties/i/picklist/12",
      "#/properties/i/picklist/13",
    ]);
  },
});
