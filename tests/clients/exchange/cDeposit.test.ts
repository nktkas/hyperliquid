import { SuccessResponse } from "@nktkas/hyperliquid/schemas";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("cDeposit", { evm: "0.00000001" }, async (_t, clients) => {
    const data = await Promise.all([
        clients.exchange.cDeposit({ wei: 1 }),
    ]);
    schemaCoverage(SuccessResponse, data);
});
