import { parser, PredictedFundingsRequest, PredictedFundingsResponse } from "@nktkas/hyperliquid/api/info";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "predictedFundings",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.predictedFundings(),
    ]);
    schemaCoverage(PredictedFundingsResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["info", "predictedFundings"]);
    parser(PredictedFundingsRequest)(JSON.parse(data));
  },
});
