import * as v from "@valibot/valibot";
import { AgentEnableDexAbstractionRequest, AgentEnableDexAbstractionResponse } from "@nktkas/hyperliquid/api/exchange";
import { excludeErrorResponse, runTest } from "./_t.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";

runTest({
  name: "agentEnableDexAbstraction",
  codeTestFn: async (_t, exchClient) => {
    const data = await Promise.all([
      exchClient.agentEnableDexAbstraction(),
    ]);
    schemaCoverage(excludeErrorResponse(AgentEnableDexAbstractionResponse), data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "agentEnableDexAbstraction",
    ]);
    v.parse(AgentEnableDexAbstractionRequest, data);
  },
});
