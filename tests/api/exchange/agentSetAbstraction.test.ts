import * as v from "@valibot/valibot";
import { AgentSetAbstractionRequest } from "@nktkas/hyperliquid/api/exchange";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/exchange/_methods/agentSetAbstraction.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "AgentSetAbstractionSuccessResponse");

runTest({
  name: "agentSetAbstraction",
  codeTestFn: async (_t, exchClient) => {
    const data = await Promise.all([
      exchClient.agentSetAbstraction({ abstraction: "u" }),
    ]);
    schemaCoverage(typeSchema, data);
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
