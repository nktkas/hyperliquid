import { AllMidsEvent } from "../../../src/api/subscription/~mod.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { collectEventsOverTime, runTest } from "./_t.ts";

runTest({
  name: "allMids",
  mode: "api",
  fn: async (_t, client) => {
    const data = await Promise.all([
      collectEventsOverTime<AllMidsEvent>(
        async (cb) => {
          await client.allMids(cb);
        },
        10_000,
      ),
      collectEventsOverTime<AllMidsEvent>(
        async (cb) => {
          await client.allMids({ dex: "unit" }, cb);
        },
        10_000,
      ),
    ]);
    schemaCoverage(AllMidsEvent, data.flat());
  },
});
