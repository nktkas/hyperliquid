import * as v from "valibot";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("liquidatable", async (_t, client) => {
    const data = await Promise.all([
        client.liquidatable(),
    ]);
    schemaCoverage(v.array(v.unknown()), data, {
        ignoreEmptyArray: ["#"],
    });
});
