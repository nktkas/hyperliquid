import { parser, PerpsAtOpenInterestCapRequest } from "@nktkas/hyperliquid/schemas";
import * as v from "valibot";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest({
    name: "perpsAtOpenInterestCap",
    codeTestFn: async (_t, client) => {
        const data = await Promise.all([
            client.perpsAtOpenInterestCap(),
        ]);
        schemaCoverage(v.array(v.string()), data);
    },
    cliTestFn: async (_t, runCommand) => {
        const data = await runCommand(["info", "perpsAtOpenInterestCap"]);
        parser(PerpsAtOpenInterestCapRequest)(JSON.parse(data));
    },
});
