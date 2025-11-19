import { NoopRequest, NoopResponse, parser } from "../../../src/api/exchange/~mod.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { excludeErrorResponse, runTest } from "./_t.ts";

runTest({
  name: "noop",
  codeTestFn: async (_t, exchClient) => {
    const data = await Promise.all([
      exchClient.noop(),
    ]);
    schemaCoverage(excludeErrorResponse(NoopResponse), data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["exchange", "noop"]);
    parser(NoopRequest)(data);
  },
});
