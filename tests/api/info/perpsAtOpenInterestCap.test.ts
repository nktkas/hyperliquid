import * as v from "@valibot/valibot";
import { PerpsAtOpenInterestCapRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/perpsAtOpenInterestCap.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "PerpsAtOpenInterestCapResponse");

runTest({
  name: "perpsAtOpenInterestCap",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.perpsAtOpenInterestCap(),
    ]);
    schemaCoverage(typeSchema, data, [
      "#/array",
    ]);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "perpsAtOpenInterestCap",
    ]);
    v.parse(PerpsAtOpenInterestCapRequest, data);
  },
});
