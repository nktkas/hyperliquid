import { SuccessResponse } from "@nktkas/hyperliquid/schemas";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("usdSend", async (_t, clients) => {
    const data = await Promise.all([
        clients.exchange.usdSend({
            destination: "0x0000000000000000000000000000000000000001",
            amount: "1",
        }),
    ]);
    schemaCoverage(SuccessResponse, data);
});
