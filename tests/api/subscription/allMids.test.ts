import { AllMidsEvent } from "@nktkas/hyperliquid/api/subscription";
import { collectEventsOverTime, runTest } from "./_t.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";

runTest({
  name: "allMids",
  mode: "api",
  fn: async (_t, client) => {
    const data = await collectEventsOverTime<AllMidsEvent>(async (cb) => {
      await client.allMids(cb);
      await client.allMids({ dex: "unit" }, cb);
    }, 10_000);
    schemaCoverage(AllMidsEvent, data);
  },
});
