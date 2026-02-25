import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { runTest } from "./_t.ts";

const sourceFile = new URL("../../../src/api/info/_methods/spotMeta.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "SpotMetaResponse");

runTest({
  name: "spotMeta",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([client.spotMeta()]);

    schemaCoverage(responseSchema, data, [
      "#/properties/outcomes/present",
      "#/properties/questions/present",
    ]);
  },
});
