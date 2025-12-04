import { SpotAssetCtxsEvent } from "@nktkas/hyperliquid/api/subscription";
import { collectEventsOverTime, runTest } from "./_t.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";

runTest({
  name: "spotAssetCtxs",
  mode: "api",
  fn: async (_t, client) => {
    const data = await collectEventsOverTime<SpotAssetCtxsEvent>(async (cb) => {
      await client.spotAssetCtxs(cb);
    }, 10_000);
    schemaCoverage(SpotAssetCtxsEvent, data);
  },
});
