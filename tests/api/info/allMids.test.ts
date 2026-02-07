import * as v from "@valibot/valibot";
import { AllMidsRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/allMids.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "AllMidsResponse");

runTest({
  name: "allMids",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.allMids(),
    ]);
    schemaCoverage(typeSchema, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "allMids",
    ]);
    v.parse(AllMidsRequest, data);
  },
});
