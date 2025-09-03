import { PerpsMetaAndAssetCtxs } from "@nktkas/hyperliquid/schemas";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("metaAndAssetCtxs", async (_t, client) => {
    const data = await Promise.all([
        client.metaAndAssetCtxs(),
    ]);
    schemaCoverage(PerpsMetaAndAssetCtxs, data);
});
