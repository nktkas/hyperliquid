import { ActiveAssetCtxEvent } from "@nktkas/hyperliquid/api/subscription";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { collectEventsOverTime, runTest } from "./_t.ts";

runTest({
  name: "activeAssetCtx",
  mode: "api",
  fn: async (_t, client) => {
    const data = await Promise.all([
      collectEventsOverTime<ActiveAssetCtxEvent>(
        async (cb) => {
          await client.activeAssetCtx({ coin: "ETH" }, cb);
        },
        10_000,
      ),
      collectEventsOverTime<ActiveAssetCtxEvent>(
        async (cb) => {
          await client.activeAssetCtx({ coin: "AXL" }, cb);
        },
        10_000,
      ),
    ]);
    schemaCoverage(ActiveAssetCtxEvent, data.flat());
  },
});
