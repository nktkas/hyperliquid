import { AllDexsAssetCtxsEvent } from "@nktkas/hyperliquid/api/subscription";
import { collectEventsOverTime, runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverageHyperliquid.ts";

runTest({
  name: "allDexsAssetCtxs",
  mode: "api",
  fn: async (_t, client) => {
    const data = await collectEventsOverTime<AllDexsAssetCtxsEvent>(async (cb) => {
      await client.allDexsAssetCtxs(cb);
    }, 10_000);
    schemaCoverage(AllDexsAssetCtxsEvent, data);
  },
});
