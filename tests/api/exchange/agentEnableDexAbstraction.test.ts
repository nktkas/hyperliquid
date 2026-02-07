import * as v from "@valibot/valibot";
import { AgentEnableDexAbstractionRequest } from "@nktkas/hyperliquid/api/exchange";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/exchange/_methods/agentEnableDexAbstraction.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "AgentEnableDexAbstractionSuccessResponse");

runTest({
  name: "agentEnableDexAbstraction",
  codeTestFn: async (_t, exchClient) => {
    const data = await Promise.all([
      exchClient.agentEnableDexAbstraction(),
    ]);
    schemaCoverage(typeSchema, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "agentEnableDexAbstraction",
    ]);
    v.parse(AgentEnableDexAbstractionRequest, data);
  },
});
