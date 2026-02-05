import { ExplorerTxsEvent } from "@nktkas/hyperliquid/api/subscription";
import { collectEventsOverTime, runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverageHyperliquid.ts";

runTest({
  name: "explorerTxs",
  mode: "rpc",
  fn: async (_t, client) => {
    const data = await collectEventsOverTime<ExplorerTxsEvent>(async (cb) => {
      await client.explorerTxs(cb);
    }, 10_000);
    schemaCoverage(ExplorerTxsEvent, data, [
      "#/items/properties/error/defined",
    ]);
  },
});
