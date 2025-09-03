import { Candle } from "@nktkas/hyperliquid/schemas";
import * as v from "valibot";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("candleSnapshot", async (_t, client) => {
    const data = await Promise.all([
        client.candleSnapshot({ coin: "ETH", interval: "15m", startTime: Date.now() - 1000 * 60 * 60 * 24 }),
    ]);
    schemaCoverage(v.array(Candle), data, {
        ignoreBranches: {
            "#/items/properties/i": [0, 1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
        },
    });
});
