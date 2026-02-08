import * as v from "@valibot/valibot";
import { type EvmUserModifyParameters, EvmUserModifyRequest } from "@nktkas/hyperliquid/api/exchange";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/exchange/_methods/evmUserModify.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "EvmUserModifySuccessResponse");
const paramsSchema = valibotToJsonSchema(v.omit(v.object(EvmUserModifyRequest.entries.action.entries), ["type"]));

runTest({
  name: "evmUserModify",
  codeTestFn: async (_t, exchClient) => {
    const params: EvmUserModifyParameters[] = [
      { usingBigBlocks: true },
      { usingBigBlocks: false },
    ];

    const data = await Promise.all(params.map((p) => exchClient.evmUserModify(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
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
