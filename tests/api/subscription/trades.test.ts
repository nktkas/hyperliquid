import { TradesEvent } from "@nktkas/hyperliquid/api/subscription";
import { collectEventsOverTime, runTest } from "./_t.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";

runTest({
  name: "trades",
  mode: "api",
  fn: async (_t, client) => {
    const data = await collectEventsOverTime<TradesEvent>(async (cb) => {
      await client.trades({ coin: "BTC" }, cb);
    }, 10_000);
    schemaCoverage(TradesEvent, data, {
      ignorePicklistValues: {
        "#/items/properties/side": ["B", "A"],
      },
    });
  },
});
