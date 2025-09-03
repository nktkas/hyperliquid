import { SuccessResponse } from "@nktkas/hyperliquid/schemas";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("reserveRequestWeight", async (_t, clients) => {
    const data = await Promise.all([
        clients.exchange.reserveRequestWeight({ weight: 1 }),
    ]);
    schemaCoverage(SuccessResponse, data);
});
