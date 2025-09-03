import { ExchangeStatus } from "@nktkas/hyperliquid/schemas";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("exchangeStatus", async (_t, client) => {
    const data = await Promise.all([
        client.exchangeStatus(),
    ]);
    schemaCoverage(ExchangeStatus, data);
});
