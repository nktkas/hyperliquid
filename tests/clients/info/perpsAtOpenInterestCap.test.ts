import * as v from "valibot";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("perpsAtOpenInterestCap", async (_t, client) => {
    const data = await Promise.all([
        client.perpsAtOpenInterestCap(),
    ]);
    schemaCoverage(v.array(v.string()), data);
});
