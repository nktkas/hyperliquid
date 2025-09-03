import { ValidatorSummary } from "@nktkas/hyperliquid/schemas";
import * as v from "valibot";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("validatorSummaries", async (_t, client) => {
    const data = await Promise.all([
        client.validatorSummaries(),
    ]);
    schemaCoverage(v.array(ValidatorSummary), data);
});
