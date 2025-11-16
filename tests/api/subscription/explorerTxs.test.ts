import { ExplorerTxsEvent } from "../../../src/api/subscription/~mod.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { collectEventsOverTime, runTest } from "./_t.ts";

runTest({
  name: "explorerTxs",
  mode: "rpc",
  fn: async (_t, client) => {
    const data = await Promise.all([
      collectEventsOverTime<ExplorerTxsEvent>(
        async (cb) => {
          await client.explorerTxs(cb);
        },
        10_000,
      ),
    ]);
    schemaCoverage(ExplorerTxsEvent, data.flat(), {
      ignoreDefinedTypes: ["#/items/properties/error"],
    });
  },
});
