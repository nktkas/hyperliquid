import { MetaAndAssetCtxsRequest, parser, PerpsMetaAndAssetCtxs } from "@nktkas/hyperliquid/schemas";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest({
    name: "metaAndAssetCtxs",
    codeTestFn: async (_t, client) => {
        const data = await Promise.all([
            client.metaAndAssetCtxs(),
        ]);
        schemaCoverage(PerpsMetaAndAssetCtxs, data);
    },
    cliTestFn: async (_t, runCommand) => {
        const data = await runCommand(["info", "metaAndAssetCtxs"]);
        parser(MetaAndAssetCtxsRequest)(JSON.parse(data));
    },
});
