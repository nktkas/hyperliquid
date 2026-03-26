import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { runTest } from "./_t.ts";

const sourceFile = new URL("../../../src/api/info/_methods/perpConciseAnnotations.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "PerpConciseAnnotationsResponse");

runTest({
  name: "perpConciseAnnotations",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([client.perpConciseAnnotations()]);

    schemaCoverage(responseSchema, data);
  },
});
