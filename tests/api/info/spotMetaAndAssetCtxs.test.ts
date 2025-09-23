import { parser, SpotMetaAndAssetCtxsRequest, SpotMetaAndAssetCtxsResponse } from "@nktkas/hyperliquid/api/info";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "spotMetaAndAssetCtxs",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.spotMetaAndAssetCtxs(),
    ]);
    schemaCoverage(SpotMetaAndAssetCtxsResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["info", "spotMetaAndAssetCtxs"]);
    parser(SpotMetaAndAssetCtxsRequest)(JSON.parse(data));
  },
});
