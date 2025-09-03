import { SpotMeta } from "@nktkas/hyperliquid/schemas";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("spotMeta", async (_t, client) => {
    const data = await Promise.all([
        client.spotMeta(),
    ]);
    schemaCoverage(SpotMeta, data);
});
