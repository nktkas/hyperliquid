import { AssetCtxsEvent } from "@nktkas/hyperliquid/api/subscription";
import { collectEventsOverTime, runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverageHyperliquid.ts";

runTest({
  name: "assetCtxs",
  mode: "api",
  fn: async (_t, client) => {
    const data = await collectEventsOverTime<AssetCtxsEvent>(async (cb) => {
      await client.assetCtxs(cb);
    }, 10_000);
    schemaCoverage(AssetCtxsEvent, data);
  },
});
