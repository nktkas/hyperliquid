import { ActiveAssetCtxEvent } from "@nktkas/hyperliquid/api/subscription";
import { collectEventsOverTime, runTest } from "./_t.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";

runTest({
  name: "activeAssetCtx",
  mode: "api",
  fn: async (_t, client) => {
    const data = await collectEventsOverTime<ActiveAssetCtxEvent>(async (cb) => {
      await client.activeAssetCtx({ coin: "ETH" }, cb);
      await client.activeAssetCtx({ coin: "AXL" }, cb);
    }, 10_000);
    schemaCoverage(ActiveAssetCtxEvent, data);
  },
});
