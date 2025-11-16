import { TradesEvent } from "../../../src/api/subscription/~mod.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { collectEventsOverTime, runTest } from "./_t.ts";

runTest({
  name: "trades",
  mode: "api",
  fn: async (_t, client) => {
    const data = await Promise.all([
      collectEventsOverTime<TradesEvent>(
        async (cb) => {
          await client.trades({ coin: "BTC" }, cb);
        },
        10_000,
      ),
    ]);
    schemaCoverage(TradesEvent, data.flat(), {
      ignoreBranches: {
        "#/items/properties/side": [0, 1],
      },
    });
  },
});
