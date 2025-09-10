import { parser, SpotMeta, SpotMetaRequest } from "@nktkas/hyperliquid/schemas";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest({
    name: "spotMeta",
    codeTestFn: async (_t, client) => {
        const data = await Promise.all([
            client.spotMeta(),
        ]);
        schemaCoverage(SpotMeta, data);
    },
    cliTestFn: async (_t, runCommand) => {
        const data = await runCommand(["info", "spotMeta"]);
        parser(SpotMetaRequest)(JSON.parse(data));
    },
});
