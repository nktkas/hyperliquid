import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { runTest } from "./_t.ts";

const sourceFile = new URL("../../../src/api/info/_methods/usdcRouting.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "UsdcRoutingResponse");

runTest({
  name: "usdcRouting",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([client.usdcRouting()]);

    schemaCoverage(responseSchema, data, [
      "#/properties/depositRoute/enum/0",
      "#/properties/withdrawalRoute/enum/0",
    ]);
  },
});
