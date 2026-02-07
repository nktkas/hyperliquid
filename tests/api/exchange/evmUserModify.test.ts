import * as v from "@valibot/valibot";
import { EvmUserModifyRequest } from "@nktkas/hyperliquid/api/exchange";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/exchange/_methods/evmUserModify.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "EvmUserModifySuccessResponse");

runTest({
  name: "evmUserModify",
  codeTestFn: async (_t, exchClient) => {
    const data = await Promise.all([
      exchClient.evmUserModify({ usingBigBlocks: true }),
    ]);
    schemaCoverage(typeSchema, data);
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
