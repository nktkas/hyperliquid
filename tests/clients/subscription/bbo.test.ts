import { WsBbo } from "@nktkas/hyperliquid/schemas";
import { deadline } from "jsr:@std/async@1/deadline";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("bbo", "api", async (_t, client) => {
    const data = await Promise.all([
        deadline(
            new Promise<WsBbo>((resolve) => {
                client.bbo({ coin: "ETH" }, resolve);
            }),
            120_000,
        ),
    ]);
    schemaCoverage(WsBbo, data, {
        ignoreBranches: {
            "#/properties/bbo/items/0": [1],
            "#/properties/bbo/items/1": [1],
        },
    });
});
