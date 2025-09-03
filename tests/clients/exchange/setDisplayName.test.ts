import { SuccessResponse } from "@nktkas/hyperliquid/schemas";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("setDisplayName", async (_t, clients) => {
    const data = await Promise.all([
        clients.exchange.setDisplayName({ displayName: "" }),
    ]);
    schemaCoverage(SuccessResponse, data);
});
