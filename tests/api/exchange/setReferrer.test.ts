import { parser, SetReferrerRequest, SetReferrerResponse } from "../../../src/api/exchange/~mod.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { excludeErrorResponse, runTest } from "./_t.ts";

runTest({
  name: "setReferrer",
  codeTestFn: async (_t, exchClient) => {
    const data = await Promise.all([
      exchClient.setReferrer({ code: "TEST" }),
    ]);
    schemaCoverage(excludeErrorResponse(SetReferrerResponse), data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["exchange", "setReferrer", "--code", "TEST"]);
    parser(SetReferrerRequest)(data);
  },
});
