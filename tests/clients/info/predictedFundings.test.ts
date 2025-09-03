import { PredictedFunding } from "@nktkas/hyperliquid/schemas";
import * as v from "valibot";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("predictedFundings", async (_t, client) => {
    const data = await Promise.all([
        client.predictedFundings(),
    ]);
    schemaCoverage(v.array(PredictedFunding), data);
});
