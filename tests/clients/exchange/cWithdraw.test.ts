import { SuccessResponse } from "@nktkas/hyperliquid/schemas";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("cWithdraw", { evm: "0.00000001" }, async (_t, clients) => {
    // —————————— Prepare ——————————

    await clients.exchange.cDeposit({ wei: 1 });

    // —————————— Test ——————————

    const data = await Promise.all([
        clients.exchange.cWithdraw({ wei: 1 }),
    ]);
    schemaCoverage(SuccessResponse, data);
});
