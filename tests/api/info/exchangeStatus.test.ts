import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { runTest } from "./_t.ts";

const sourceFile = new URL("../../../src/api/info/_methods/exchangeStatus.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "ExchangeStatusResponse");

runTest({
  name: "exchangeStatus",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([client.exchangeStatus()]);

    schemaCoverage(responseSchema, data, [
      "#/properties/specialStatuses/defined",
    ]);
  },
});
