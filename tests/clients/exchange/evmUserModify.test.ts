import { SuccessResponse } from "@nktkas/hyperliquid/schemas";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("evmUserModify", async (_t, clients) => {
    const data = await Promise.all([
        clients.exchange.evmUserModify({ usingBigBlocks: true }),
    ]);
    schemaCoverage(SuccessResponse, data);
});
