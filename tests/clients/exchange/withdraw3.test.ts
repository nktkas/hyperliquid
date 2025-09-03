import { SuccessResponse } from "@nktkas/hyperliquid/schemas";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("withdraw3", { perp: "2" }, async (_t, clients) => {
    const data = await Promise.all([
        clients.exchange.withdraw3({
            amount: "2",
            destination: "0x0000000000000000000000000000000000000001",
        }),
    ]);
    schemaCoverage(SuccessResponse, data);
});
