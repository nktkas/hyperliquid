import * as v from "@valibot/valibot";
import { PredictedFundingsRequest, PredictedFundingsResponse } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";

runTest({
  name: "predictedFundings",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.predictedFundings(),
    ]);
    schemaCoverage(PredictedFundingsResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "predictedFundings",
    ]);
    v.parse(PredictedFundingsRequest, data);
  },
});
