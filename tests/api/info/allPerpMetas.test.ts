import * as v from "@valibot/valibot";
import { AllPerpMetasRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/allPerpMetas.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "AllPerpMetasResponse");

runTest({
  name: "allPerpMetas",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([client.allPerpMetas()]);

    schemaCoverage(responseSchema, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "allPerpMetas",
    ]);
    v.parse(AllPerpMetasRequest, data);
  },
});
