import { Candle } from "@nktkas/hyperliquid/schemas";
import { deadline } from "jsr:@std/async@1/deadline";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("candle", "api", async (_t, client) => {
    const data = await Promise.all([
        deadline(
            new Promise<Candle>((resolve) => {
                client.candle({ coin: "SOL", interval: "1m" }, resolve);
            }),
            120_000,
        ),
    ]);
    schemaCoverage(Candle, data, {
        ignoreBranches: {
            "#/properties/i": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
        },
    });
});
