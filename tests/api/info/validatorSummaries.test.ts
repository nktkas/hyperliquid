import * as v from "@valibot/valibot";
import { ValidatorSummariesRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/validatorSummaries.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "ValidatorSummariesResponse");

runTest({
  name: "validatorSummaries",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([client.validatorSummaries()]);

    schemaCoverage(responseSchema, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "validatorSummaries",
    ]);
    v.parse(ValidatorSummariesRequest, data);
  },
});
