import { ExplorerBlockEvent } from "../../../src/api/subscription/~mod.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { collectEventsOverTime, runTest } from "./_t.ts";

runTest({
  name: "explorerBlock",
  mode: "rpc",
  fn: async (_t, client) => {
    const data = await Promise.all([
      collectEventsOverTime<ExplorerBlockEvent>(
        async (cb) => {
          await client.explorerBlock(cb);
        },
        10_000,
      ),
    ]);
    schemaCoverage(ExplorerBlockEvent, data.flat());
  },
});
