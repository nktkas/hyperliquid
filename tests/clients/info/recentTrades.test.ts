import { parser, RecentTradesRequest, Trade } from "@nktkas/hyperliquid/schemas";
import * as v from "valibot";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest({
    name: "recentTrades",
    codeTestFn: async (_t, client) => {
        const data = await Promise.all([
            client.recentTrades({ coin: "ETH" }),
        ]);
        schemaCoverage(v.array(Trade), data, {
            ignoreBranches: {
                "#/items/properties/side": [0, 1],
            },
        });
    },
    cliTestFn: async (_t, runCommand) => {
        const data = await runCommand(["info", "recentTrades", "--coin", "ETH"]);
        parser(RecentTradesRequest)(JSON.parse(data));
    },
});
