import * as v from "@valibot/valibot";
import { LiquidatableRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/liquidatable.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "LiquidatableResponse");

runTest({
  name: "liquidatable",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.liquidatable(),
    ]);
    schemaCoverage(typeSchema, data, [
      "#/array",
    ]);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "liquidatable",
    ]);
    v.parse(LiquidatableRequest, data);
  },
});
