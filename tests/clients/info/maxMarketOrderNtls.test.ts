import { MaxMarketOrderNtlsRequest, parser } from "@nktkas/hyperliquid/schemas";
import * as v from "valibot";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest({
    name: "maxMarketOrderNtls",
    codeTestFn: async (_t, client) => {
        const data = await Promise.all([
            client.maxMarketOrderNtls(),
        ]);
        schemaCoverage(v.array(v.strictTuple([v.number(), v.string()])), data);
    },
    cliTestFn: async (_t, runCommand) => {
        const data = await runCommand(["info", "maxMarketOrderNtls"]);
        parser(MaxMarketOrderNtlsRequest)(JSON.parse(data));
    },
});
