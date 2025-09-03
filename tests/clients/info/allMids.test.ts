import { AllMids } from "@nktkas/hyperliquid/schemas";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("allMids", async (_t, client) => {
    const data = await Promise.all([
        client.allMids(),
    ]);
    schemaCoverage(AllMids, data);
});
