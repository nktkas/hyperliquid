import { ActiveSpotAssetCtxEvent } from "../../../src/api/subscription/~mod.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { collectEventsOverTime, runTest } from "./_t.ts";

runTest({
  name: "activeSpotAssetCtx",
  mode: "api",
  fn: async (_t, client) => {
    const data = await Promise.all([
      collectEventsOverTime<ActiveSpotAssetCtxEvent>(
        async (cb) => {
          await client.activeSpotAssetCtx({ coin: "@107" }, cb);
        },
        10_000,
      ),
      collectEventsOverTime<ActiveSpotAssetCtxEvent>(
        async (cb) => {
          await client.activeSpotAssetCtx({ coin: "@27" }, cb);
        },
        10_000,
      ),
    ]);
    schemaCoverage(ActiveSpotAssetCtxEvent, data.flat());
  },
});
