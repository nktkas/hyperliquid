import { parser, PerpDex, PerpDexsRequest } from "@nktkas/hyperliquid/schemas";
import * as v from "valibot";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest({
    name: "perpDexs",
    codeTestFn: async (_t, client) => {
        const data = await Promise.all([
            client.perpDexs(),
        ]);
        schemaCoverage(v.array(v.nullable(PerpDex)), data);
    },
    cliTestFn: async (_t, runCommand) => {
        const data = await runCommand(["info", "perpDexs"]);
        parser(PerpDexsRequest)(JSON.parse(data));
    },
});
