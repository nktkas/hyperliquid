import * as v from "valibot";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("maxMarketOrderNtls", async (_t, client) => {
    const data = await Promise.all([
        client.maxMarketOrderNtls(),
    ]);
    schemaCoverage(v.array(v.strictTuple([v.number(), v.string()])), data);
});
