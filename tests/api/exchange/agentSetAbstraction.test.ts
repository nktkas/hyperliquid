import * as v from "@valibot/valibot";
import { AgentSetAbstractionRequest, AgentSetAbstractionResponse } from "@nktkas/hyperliquid/api/exchange";
import { runTest } from "./_t.ts";
import { excludeErrorResponse, schemaCoverage } from "../_utils/schemaCoverageHyperliquid.ts";

runTest({
  name: "agentSetAbstraction",
  codeTestFn: async (_t, exchClient) => {
    const data = await Promise.all([
      exchClient.agentSetAbstraction({ abstraction: "u" }),
    ]);
    schemaCoverage(excludeErrorResponse(AgentSetAbstractionResponse), data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "agentSetAbstraction",
      "--abstraction=u",
    ]);
    v.parse(AgentSetAbstractionRequest, data);
  },
});
