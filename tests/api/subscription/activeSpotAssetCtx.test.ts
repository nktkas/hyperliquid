import { ActiveSpotAssetCtxEvent } from "@nktkas/hyperliquid/api/subscription";
import { collectEventsOverTime, runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverageHyperliquid.ts";

runTest({
  name: "activeSpotAssetCtx",
  mode: "api",
  fn: async (_t, client) => {
    const data = await collectEventsOverTime<ActiveSpotAssetCtxEvent>(async (cb) => {
      await client.activeSpotAssetCtx({ coin: "@107" }, cb);
      await client.activeSpotAssetCtx({ coin: "@27" }, cb);
    }, 10_000);
    schemaCoverage(ActiveSpotAssetCtxEvent, data);
  },
});
