import * as v from "@valibot/valibot";
import { SpotMetaAndAssetCtxsRequest, SpotMetaAndAssetCtxsResponse } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverageHyperliquid.ts";

runTest({
  name: "spotMetaAndAssetCtxs",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.spotMetaAndAssetCtxs(),
    ]);
    schemaCoverage(SpotMetaAndAssetCtxsResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "spotMetaAndAssetCtxs",
    ]);
    v.parse(SpotMetaAndAssetCtxsRequest, data);
  },
});
