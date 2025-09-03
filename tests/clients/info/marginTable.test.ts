import { MarginTable } from "@nktkas/hyperliquid/schemas";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("marginTable", async (_t, client) => {
    const data = await Promise.all([
        client.marginTable({ id: 1 }),
    ]);
    schemaCoverage(MarginTable, data);
});
