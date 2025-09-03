import { BlockDetails } from "@nktkas/hyperliquid/schemas";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("blockDetails", async (_t, client) => {
    const data = await Promise.all([
        client.blockDetails({ height: 300836507 }),
    ]);
    schemaCoverage(BlockDetails, data);
});
