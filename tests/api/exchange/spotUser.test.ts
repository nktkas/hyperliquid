import { parser, SpotUserRequest, SpotUserResponse } from "../../../src/api/exchange/~mod.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { excludeErrorResponse, runTest } from "./_t.ts";

runTest({
  name: "spotUser",
  codeTestFn: async (_t, exchClient) => {
    const data = await Promise.all([
      exchClient.spotUser({ toggleSpotDusting: { optOut: true } }),
    ]);
    schemaCoverage(excludeErrorResponse(SpotUserResponse), data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["exchange", "spotUser", "--optOut", "true"]);
    parser(SpotUserRequest)(data);
  },
});
