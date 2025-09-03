import * as v from "valibot";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("maxBuilderFee", async (_t, client) => {
    const data = await Promise.all([
        client.maxBuilderFee({
            user: "0xe019d6167E7e324aEd003d94098496b6d986aB05",
            builder: "0xe019d6167E7e324aEd003d94098496b6d986aB05",
        }),
    ]);
    schemaCoverage(v.number(), data);
});
