import { parser, SetDisplayNameRequest, SuccessResponse } from "../../../src/api/exchange/~mod.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "setDisplayName",
  codeTestFn: async (_t, exchClient) => {
    const data = await Promise.all([
      exchClient.setDisplayName({ displayName: "" }),
    ]);
    schemaCoverage(SuccessResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["exchange", "setDisplayName", "--displayName", "test"]);
    parser(SetDisplayNameRequest)(data);
  },
});
