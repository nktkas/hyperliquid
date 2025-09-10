import { MarginTable, MarginTableRequest, parser } from "@nktkas/hyperliquid/schemas";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest({
    name: "marginTable",
    codeTestFn: async (_t, client) => {
        const data = await Promise.all([
            client.marginTable({ id: 1 }),
        ]);
        schemaCoverage(MarginTable, data);
    },
    cliTestFn: async (_t, runCommand) => {
        const data = await runCommand(["info", "marginTable", "--id", "1"]);
        parser(MarginTableRequest)(JSON.parse(data));
    },
});
