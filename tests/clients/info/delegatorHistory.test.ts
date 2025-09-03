import { DelegatorUpdate } from "@nktkas/hyperliquid/schemas";
import * as v from "valibot";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("delegatorHistory", async (_t, client) => {
    const data = await Promise.all([
        client.delegatorHistory({ user: "0xedc88158266c50628a9ffbaa1db2635376577eea" }),
    ]);
    schemaCoverage(v.array(DelegatorUpdate), data);
});
