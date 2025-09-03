import { SuccessResponse } from "@nktkas/hyperliquid/schemas";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("usdClassTransfer", { perp: "1" }, async (_t, clients) => {
    const data = await Promise.all([
        clients.exchange.usdClassTransfer({ amount: "1", toPerp: false }),
    ]);
    schemaCoverage(SuccessResponse, data);
});
