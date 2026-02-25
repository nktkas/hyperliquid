import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { runTest } from "./_t.ts";

const sourceFile = new URL("../../../src/api/exchange/_methods/noop.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "NoopSuccessResponse");

runTest({
  name: "noop",
  codeTestFn: async (_t, exchClient) => {
    const data = await Promise.all([exchClient.noop()]);

    schemaCoverage(responseSchema, data);
  },
});
