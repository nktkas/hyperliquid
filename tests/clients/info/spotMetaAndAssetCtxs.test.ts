import { SpotMetaAndAssetCtxs } from "@nktkas/hyperliquid/schemas";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("spotMetaAndAssetCtxs", async (_t, client) => {
    const data = await Promise.all([
        client.spotMetaAndAssetCtxs(),
    ]);
    schemaCoverage(SpotMetaAndAssetCtxs, data);
});
