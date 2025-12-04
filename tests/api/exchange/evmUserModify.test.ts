import * as v from "@valibot/valibot";
import { EvmUserModifyRequest, EvmUserModifyResponse } from "@nktkas/hyperliquid/api/exchange";
import { excludeErrorResponse, runTest } from "./_t.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";

runTest({
  name: "evmUserModify",
  codeTestFn: async (_t, exchClient) => {
    const data = await Promise.all([
      exchClient.evmUserModify({ usingBigBlocks: true }),
    ]);
    schemaCoverage(excludeErrorResponse(EvmUserModifyResponse), data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "evmUserModify",
      "--usingBigBlocks=true",
    ]);
    v.parse(EvmUserModifyRequest, data);
  },
});
