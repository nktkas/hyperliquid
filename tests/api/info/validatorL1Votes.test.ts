import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/validatorL1Votes.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "ValidatorL1VotesResponse");

runTest({
  name: "validatorL1Votes",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([client.validatorL1Votes()]);

    schemaCoverage(responseSchema, data, [
      "#/array",
    ]);
  },
});
