import { MetaAndAssetCtxsRequest, MetaAndAssetCtxsResponse, parser } from "@nktkas/hyperliquid/api/info";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "metaAndAssetCtxs",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.metaAndAssetCtxs(),
    ]);
    schemaCoverage(MetaAndAssetCtxsResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["info", "metaAndAssetCtxs"]);
    parser(MetaAndAssetCtxsRequest)(JSON.parse(data));
  },
});
