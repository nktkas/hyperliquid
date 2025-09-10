import { parser, VaultSummariesRequest, VaultSummary } from "@nktkas/hyperliquid/schemas";
import * as v from "valibot";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest({
    name: "vaultSummaries",
    codeTestFn: async (_t, client) => {
        const data = await Promise.all([
            client.vaultSummaries(),
        ]);
        schemaCoverage(v.array(VaultSummary), data, {
            ignoreEmptyArray: ["#"],
        });
    },
    cliTestFn: async (_t, runCommand) => {
        const data = await runCommand(["info", "vaultSummaries"]);
        parser(VaultSummariesRequest)(JSON.parse(data));
    },
});
