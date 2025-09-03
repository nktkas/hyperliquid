import { WsTrade } from "@nktkas/hyperliquid/schemas";
import { deadline } from "jsr:@std/async@1/deadline";
import * as v from "valibot";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("trades", "api", async (_t, client) => {
    const data = await Promise.all([
        deadline(
            new Promise<WsTrade[]>((resolve) => {
                client.trades({ coin: "ETH" }, resolve);
            }),
            10_000,
        ),
    ]);
    schemaCoverage(v.array(WsTrade), data);
});
