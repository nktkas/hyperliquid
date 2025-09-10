import { MetaRequest, parser, PerpsMeta } from "@nktkas/hyperliquid/schemas";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest({
    name: "meta",
    codeTestFn: async (_t, client) => {
        const data = await Promise.all([
            client.meta(),
            client.meta({ dex: "test" }),
        ]);
        schemaCoverage(PerpsMeta, data);
    },
    cliTestFn: async (_t, runCommand) => {
        const data = await runCommand(["info", "meta"]);
        parser(MetaRequest)(JSON.parse(data));
    },
});
