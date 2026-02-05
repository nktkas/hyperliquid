import { L2BookEvent } from "@nktkas/hyperliquid/api/subscription";
import { collectEventsOverTime, runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverageHyperliquid.ts";

runTest({
  name: "l2Book",
  mode: "api",
  fn: async (_t, client) => {
    const data = await collectEventsOverTime<L2BookEvent>(async (cb) => {
      await client.l2Book({ coin: "BTC" }, cb);
    }, 10_000);
    schemaCoverage(L2BookEvent, data);
  },
});
