import { PerpDexLimits } from "@nktkas/hyperliquid/schemas";
import * as v from "valibot";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("perpDexLimits", async (_t, client) => {
    const data = await Promise.all([
        client.perpDexLimits({ dex: "" }),
        client.perpDexLimits({ dex: "vntls" }),
    ]);
    schemaCoverage(v.union([PerpDexLimits, v.null()]), data);
});
