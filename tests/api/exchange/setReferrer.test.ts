import * as v from "@valibot/valibot";
import { SetReferrerRequest } from "@nktkas/hyperliquid/api/exchange";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/exchange/_methods/setReferrer.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "SetReferrerSuccessResponse");

runTest({
  name: "setReferrer",
  codeTestFn: async (_t, exchClient) => {
    const data = await Promise.all([
      exchClient.setReferrer({ code: "TEST" }),
    ]);
    schemaCoverage(typeSchema, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "setReferrer",
      "--code=TEST",
    ]);
    v.parse(SetReferrerRequest, data);
  },
});
