import { ExchangeStatus, ExchangeStatusRequest, parser } from "@nktkas/hyperliquid/schemas";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest({
    name: "exchangeStatus",
    codeTestFn: async (_t, client) => {
        const data = await Promise.all([
            client.exchangeStatus(),
        ]);
        schemaCoverage(ExchangeStatus, data);
    },
    cliTestFn: async (_t, runCommand) => {
        const data = await runCommand(["info", "exchangeStatus"]);
        parser(ExchangeStatusRequest)(JSON.parse(data));
    },
});
