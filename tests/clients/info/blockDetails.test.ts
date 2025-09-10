import { BlockDetails, BlockDetailsRequest, parser } from "@nktkas/hyperliquid/schemas";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest({
    name: "blockDetails",
    codeTestFn: async (_t, client) => {
        const data = await Promise.all([
            client.blockDetails({ height: 300836507 }),
        ]);
        schemaCoverage(BlockDetails, data);
    },
    cliTestFn: async (_t, runCommand) => {
        const data = await runCommand(["info", "blockDetails", "--height", "300836507"]);
        parser(BlockDetailsRequest)(JSON.parse(data));
    },
});
