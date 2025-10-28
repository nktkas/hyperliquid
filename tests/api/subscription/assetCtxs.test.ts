import { AssetCtxsEvent } from "@nktkas/hyperliquid/api/subscription";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { collectEventsOverTime, runTest } from "./_t.ts";

runTest({
  name: "assetCtxs",
  mode: "api",
  fn: async (_t, client) => {
    const data = await Promise.all([
      collectEventsOverTime<AssetCtxsEvent>(
        async (cb) => {
          await client.assetCtxs(cb);
        },
        10_000,
      ),
    ]);
    schemaCoverage(AssetCtxsEvent, data.flat());
  },
});
