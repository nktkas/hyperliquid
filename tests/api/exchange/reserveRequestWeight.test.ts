import { parser, ReserveRequestWeightRequest, SuccessResponse } from "../../../src/api/exchange/~mod.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "reserveRequestWeight",
  codeTestFn: async (_t, exchClient) => {
    const data = await Promise.all([
      exchClient.reserveRequestWeight({ weight: 1 }),
    ]);
    schemaCoverage(SuccessResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["exchange", "reserveRequestWeight", "--weight", "1"]);
    parser(ReserveRequestWeightRequest)(data);
  },
});
