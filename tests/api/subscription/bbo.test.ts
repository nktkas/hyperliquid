import { BboEvent } from "@nktkas/hyperliquid/api/subscription";
import { collectEventsOverTime, runTest } from "./_t.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";

runTest({
  name: "bbo",
  mode: "api",
  fn: async (_t, client) => {
    const data = await collectEventsOverTime<BboEvent>(async (cb) => {
      await client.bbo({ coin: "BTC" }, cb);
      await client.bbo({ coin: "ETH" }, cb);
      await client.bbo({ coin: "SOL" }, cb);
    }, 60_000);
    schemaCoverage(BboEvent, data);
  },
});
