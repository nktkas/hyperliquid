import { MetaAndAssetCtxsRequest, MetaAndAssetCtxsResponse, parser } from "../../../src/api/info/~mod.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "metaAndAssetCtxs",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.metaAndAssetCtxs(),
      client.metaAndAssetCtxs({ dex: "gato" }),
    ]);
    schemaCoverage(MetaAndAssetCtxsResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["info", "metaAndAssetCtxs"]);
    parser(MetaAndAssetCtxsRequest)(JSON.parse(data));
  },
});
