import * as v from "valibot";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("validatorL1Votes", async (_t, client) => {
    const data = await Promise.all([
        client.validatorL1Votes(),
    ]);
    schemaCoverage(v.array(v.unknown()), data, {
        ignoreEmptyArray: ["#"],
    });
});
