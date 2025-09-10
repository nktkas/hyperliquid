import { FundingHistory, FundingHistoryRequest, parser } from "@nktkas/hyperliquid/schemas";
import * as v from "valibot";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest({
    name: "fundingHistory",
    codeTestFn: async (_t, client) => {
        const data = await Promise.all([
            client.fundingHistory({
                coin: "ETH",
                startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
            }),
        ]);
        schemaCoverage(v.array(FundingHistory), data);
    },
    cliTestFn: async (_t, runCommand) => {
        const data = await runCommand(["info", "fundingHistory", "--coin", "ETH", "--startTime", "1725991126328"]);
        parser(FundingHistoryRequest)(JSON.parse(data));
    },
});
