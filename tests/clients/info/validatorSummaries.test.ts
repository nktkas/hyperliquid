import { parser, ValidatorSummariesRequest, ValidatorSummary } from "@nktkas/hyperliquid/schemas";
import * as v from "valibot";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest({
    name: "validatorSummaries",
    codeTestFn: async (_t, client) => {
        const data = await Promise.all([
            client.validatorSummaries(),
        ]);
        schemaCoverage(v.array(ValidatorSummary), data);
    },
    cliTestFn: async (_t, runCommand) => {
        const data = await runCommand(["info", "validatorSummaries"]);
        parser(ValidatorSummariesRequest)(JSON.parse(data));
    },
});
