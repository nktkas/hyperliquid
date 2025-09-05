import { Trade } from "@nktkas/hyperliquid/schemas";
import * as v from "valibot";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("recentTrades", async (_t, client) => {
    const data = await Promise.all([
        client.recentTrades({ coin: "ETH" }),
    ]);
    schemaCoverage(v.array(Trade), data, {
        ignoreBranches: {
            "#/items/properties/side": [0, 1],
        },
    });
});
