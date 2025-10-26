import { EvmUserModifyRequest, parser, SuccessResponse } from "@nktkas/hyperliquid/api/exchange";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "evmUserModify",
  codeTestFn: async (_t, exchClient) => {
    const data = await Promise.all([
      exchClient.evmUserModify({ usingBigBlocks: true }),
    ]);
    schemaCoverage(SuccessResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["exchange", "evmUserModify", "--usingBigBlocks", "true"]);
    parser(EvmUserModifyRequest)(data);
  },
});
