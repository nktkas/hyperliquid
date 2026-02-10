import * as v from "@valibot/valibot";
import { type AgentSetAbstractionParameters, AgentSetAbstractionRequest } from "@nktkas/hyperliquid/api/exchange";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/exchange/_methods/agentSetAbstraction.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "AgentSetAbstractionSuccessResponse");
const paramsSchema = valibotToJsonSchema(v.omit(v.object(AgentSetAbstractionRequest.entries.action.entries), ["type"]));

runTest({
  name: "agentSetAbstraction",
  codeTestFn: async (_t, exchClient) => {
    const params: AgentSetAbstractionParameters[] = [
      { abstraction: "u" },
    ];

    const data = await Promise.all(params.map((p) => exchClient.agentSetAbstraction(p)));

    schemaCoverage(paramsSchema, params, [
      "#/properties/abstraction/enum/0", // 'i' - transition not allowed
      "#/properties/abstraction/enum/2", // 'p' - transition not allowed
    ]);
    schemaCoverage(responseSchema, data);
  },
});
