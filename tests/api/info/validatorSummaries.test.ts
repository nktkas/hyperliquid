import { parser, ValidatorSummariesRequest, ValidatorSummariesResponse } from "@nktkas/hyperliquid/api/info";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "validatorSummaries",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.validatorSummaries(),
    ]);
    schemaCoverage(ValidatorSummariesResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["info", "validatorSummaries"]);
    parser(ValidatorSummariesRequest)(JSON.parse(data));
  },
});
