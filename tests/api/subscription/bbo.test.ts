import { BboEvent } from "../../../src/api/subscription/~mod.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { collectEventsOverTime, runTest } from "./_t.ts";

runTest({
  name: "bbo",
  mode: "api",
  fn: async (_t, client) => {
    const data = await Promise.all([
      collectEventsOverTime<BboEvent>(
        async (cb) => {
          await client.bbo({ coin: "BTC" }, cb);
        },
        60_000,
      ),
      collectEventsOverTime<BboEvent>(
        async (cb) => {
          await client.bbo({ coin: "ETH" }, cb);
        },
        60_000,
      ),
      collectEventsOverTime<BboEvent>(
        async (cb) => {
          await client.bbo({ coin: "SOL" }, cb);
        },
        60_000,
      ),
    ]);
    schemaCoverage(BboEvent, data.flat());
  },
});
