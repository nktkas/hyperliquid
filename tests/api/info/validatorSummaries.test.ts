import * as v from "@valibot/valibot";
import { ValidatorSummariesRequest, ValidatorSummariesResponse } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverageHyperliquid.ts";

runTest({
  name: "validatorSummaries",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.validatorSummaries(),
    ]);
    schemaCoverage(ValidatorSummariesResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "validatorSummaries",
    ]);
    v.parse(ValidatorSummariesRequest, data);
  },
});
