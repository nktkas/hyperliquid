import { AgentEnableDexAbstractionRequest, parser, SuccessResponse } from "@nktkas/hyperliquid/api/exchange";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "agentEnableDexAbstraction",
  codeTestFn: async (_t, clients) => {
    const data = await Promise.all([
      clients.exchange.agentEnableDexAbstraction(),
    ]);
    schemaCoverage(SuccessResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["exchange", "agentEnableDexAbstraction"]);
    parser(AgentEnableDexAbstractionRequest)(JSON.parse(data));
  },
});
