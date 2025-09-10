import { parser, SpotMetaAndAssetCtxs, SpotMetaAndAssetCtxsRequest } from "@nktkas/hyperliquid/schemas";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest({
    name: "spotMetaAndAssetCtxs",
    codeTestFn: async (_t, client) => {
        const data = await Promise.all([
            client.spotMetaAndAssetCtxs(),
        ]);
        schemaCoverage(SpotMetaAndAssetCtxs, data);
    },
    cliTestFn: async (_t, runCommand) => {
        const data = await runCommand(["info", "spotMetaAndAssetCtxs"]);
        parser(SpotMetaAndAssetCtxsRequest)(JSON.parse(data));
    },
});
