import * as v from "@valibot/valibot";
import { MetaAndAssetCtxsRequest, MetaAndAssetCtxsResponse } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverageHyperliquid.ts";

runTest({
  name: "metaAndAssetCtxs",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.metaAndAssetCtxs(),
      client.metaAndAssetCtxs({ dex: "gato" }),
      client.metaAndAssetCtxs({ dex: "meng" }),
    ]);
    schemaCoverage(MetaAndAssetCtxsResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "metaAndAssetCtxs",
    ]);
    v.parse(MetaAndAssetCtxsRequest, data);
  },
});
