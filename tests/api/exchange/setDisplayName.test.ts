import { parser, SetDisplayNameRequest, SetDisplayNameResponse } from "../../../src/api/exchange/~mod.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { excludeErrorResponse, runTest } from "./_t.ts";

runTest({
  name: "setDisplayName",
  codeTestFn: async (_t, exchClient) => {
    const data = await Promise.all([
      exchClient.setDisplayName({ displayName: "" }),
    ]);
    schemaCoverage(excludeErrorResponse(SetDisplayNameResponse), data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["exchange", "setDisplayName", "--displayName", "test"]);
    parser(SetDisplayNameRequest)(data);
  },
});
