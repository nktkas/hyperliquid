import { AllMids, AllMidsRequest, parser } from "@nktkas/hyperliquid/schemas";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest({
    name: "allMids",
    codeTestFn: async (_t, client) => {
        const data = await Promise.all([
            client.allMids(),
        ]);
        schemaCoverage(AllMids, data);
    },
    cliTestFn: async (_t, runCommand) => {
        const data = await runCommand(["info", "allMids"]);
        parser(AllMidsRequest)(JSON.parse(data));
    },
});
