import { SuccessResponse } from "@nktkas/hyperliquid/schemas";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("noop", async (_t, clients) => {
    const data = await Promise.all([
        clients.exchange.noop(),
    ]);
    schemaCoverage(SuccessResponse, data);
});
