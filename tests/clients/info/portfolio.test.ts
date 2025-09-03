import { PortfolioPeriods } from "@nktkas/hyperliquid/schemas";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("portfolio", async (_t, client) => {
    const data = await Promise.all([
        client.portfolio({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }),
    ]);
    schemaCoverage(PortfolioPeriods, data);
});
