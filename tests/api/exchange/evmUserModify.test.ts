import { EvmUserModifyRequest, EvmUserModifyResponse, parser } from "../../../src/api/exchange/~mod.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { excludeErrorResponse, runTest } from "./_t.ts";

runTest({
  name: "evmUserModify",
  codeTestFn: async (_t, exchClient) => {
    const data = await Promise.all([
      exchClient.evmUserModify({ usingBigBlocks: true }),
    ]);
    schemaCoverage(excludeErrorResponse(EvmUserModifyResponse), data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["exchange", "evmUserModify", "--usingBigBlocks", "true"]);
    parser(EvmUserModifyRequest)(data);
  },
});
