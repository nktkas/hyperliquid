import { parser, ReserveRequestWeightRequest, ReserveRequestWeightResponse } from "../../../src/api/exchange/~mod.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { excludeErrorResponse, runTest } from "./_t.ts";

runTest({
  name: "reserveRequestWeight",
  codeTestFn: async (_t, exchClient) => {
    const data = await Promise.all([
      exchClient.reserveRequestWeight({ weight: 1 }),
    ]);
    schemaCoverage(excludeErrorResponse(ReserveRequestWeightResponse), data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["exchange", "reserveRequestWeight", "--weight", "1"]);
    parser(ReserveRequestWeightRequest)(data);
  },
});
