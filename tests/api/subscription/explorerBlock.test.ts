import { ExplorerBlockEvent } from "@nktkas/hyperliquid/api/subscription";
import { collectEventsOverTime, runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverageHyperliquid.ts";

runTest({
  name: "explorerBlock",
  mode: "rpc",
  fn: async (_t, client) => {
    const data = await collectEventsOverTime<ExplorerBlockEvent>(async (cb) => {
      await client.explorerBlock(cb);
    }, 10_000);
    schemaCoverage(ExplorerBlockEvent, data);
  },
});
