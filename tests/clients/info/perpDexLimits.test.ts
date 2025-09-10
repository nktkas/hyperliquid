import { parser, PerpDexLimits, PerpDexLimitsRequest } from "@nktkas/hyperliquid/schemas";
import * as v from "valibot";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest({
    name: "perpDexLimits",
    codeTestFn: async (_t, client) => {
        const data = await Promise.all([
            client.perpDexLimits({ dex: "" }),
            client.perpDexLimits({ dex: "vntls" }),
        ]);
        schemaCoverage(v.union([PerpDexLimits, v.null()]), data);
    },
    cliTestFn: async (_t, runCommand) => {
        const data = await runCommand(["info", "perpDexLimits", "--dex", "vntls"]);
        parser(PerpDexLimitsRequest)(JSON.parse(data));
    },
});
