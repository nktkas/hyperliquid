import * as v from "@valibot/valibot";
import { PredictedFundingsRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/predictedFundings.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "PredictedFundingsResponse");

runTest({
  name: "predictedFundings",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([client.predictedFundings()]);

    schemaCoverage(responseSchema, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "predictedFundings",
    ]);
    v.parse(PredictedFundingsRequest, data);
  },
});
