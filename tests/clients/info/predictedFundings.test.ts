import { parser, PredictedFunding, PredictedFundingsRequest } from "@nktkas/hyperliquid/schemas";
import * as v from "valibot";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest({
    name: "predictedFundings",
    codeTestFn: async (_t, client) => {
        const data = await Promise.all([
            client.predictedFundings(),
        ]);
        schemaCoverage(v.array(PredictedFunding), data);
    },
    cliTestFn: async (_t, runCommand) => {
        const data = await runCommand(["info", "predictedFundings"]);
        parser(PredictedFundingsRequest)(JSON.parse(data));
    },
});
