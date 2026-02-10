import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/liquidatable.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "LiquidatableResponse");

runTest({
  name: "liquidatable",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([client.liquidatable()]);

    schemaCoverage(responseSchema, data, [
      "#/array",
    ]);
  },
});
