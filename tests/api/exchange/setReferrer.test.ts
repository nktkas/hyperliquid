import { parser, SetReferrerRequest, SuccessResponse } from "../../../src/api/exchange/~mod.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "setReferrer",
  codeTestFn: async (_t, exchClient) => {
    const data = await Promise.all([
      exchClient.setReferrer({ code: "TEST" }),
    ]);
    schemaCoverage(SuccessResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["exchange", "setReferrer", "--code", "TEST"]);
    parser(SetReferrerRequest)(data);
  },
});
