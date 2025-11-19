import { SpotAssetCtxsEvent } from "../../../src/api/subscription/~mod.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { collectEventsOverTime, runTest } from "./_t.ts";

runTest({
  name: "spotAssetCtxs",
  mode: "api",
  fn: async (_t, client) => {
    const data = await Promise.all([
      collectEventsOverTime<SpotAssetCtxsEvent>(
        async (cb) => {
          await client.spotAssetCtxs(cb);
        },
        10_000,
      ),
    ]);
    schemaCoverage(SpotAssetCtxsEvent, data.flat());
  },
});
