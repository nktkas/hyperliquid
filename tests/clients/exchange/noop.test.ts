import { NoopRequest, parser, SuccessResponse } from "@nktkas/hyperliquid/schemas";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest({
    name: "noop",
    codeTestFn: async (_t, clients) => {
        const data = await Promise.all([
            clients.exchange.noop(),
        ]);
        schemaCoverage(SuccessResponse, data);
    },
    cliTestFn: async (_t, runCommand) => {
        const data = await runCommand(["exchange", "noop"]);
        parser(NoopRequest)(JSON.parse(data));
    },
});
