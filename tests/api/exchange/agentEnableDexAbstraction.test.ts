import {
  AgentEnableDexAbstractionRequest,
  AgentEnableDexAbstractionResponse,
  parser,
} from "../../../src/api/exchange/~mod.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { excludeErrorResponse, runTest } from "./_t.ts";

runTest({
  name: "agentEnableDexAbstraction",
  codeTestFn: async (_t, exchClient) => {
    const data = await Promise.all([
      exchClient.agentEnableDexAbstraction(),
    ]);
    schemaCoverage(excludeErrorResponse(AgentEnableDexAbstractionResponse), data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["exchange", "agentEnableDexAbstraction"]);
    parser(AgentEnableDexAbstractionRequest)(data);
  },
});
