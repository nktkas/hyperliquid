import { L2BookEvent } from "../../../src/api/subscription/~mod.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { collectEventsOverTime, runTest } from "./_t.ts";

runTest({
  name: "l2Book",
  mode: "api",
  fn: async (_t, client) => {
    const data = await Promise.all([
      collectEventsOverTime<L2BookEvent>(
        async (cb) => {
          await client.l2Book({ coin: "BTC" }, cb);
        },
        10_000,
      ),
    ]);
    schemaCoverage(L2BookEvent, data.flat());
  },
});
