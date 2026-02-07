import * as v from "@valibot/valibot";
import { ValidatorL1VotesRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/validatorL1Votes.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "ValidatorL1VotesResponse");

runTest({
  name: "validatorL1Votes",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.validatorL1Votes(),
    ]);
    schemaCoverage(typeSchema, data, [
      "#/array",
    ]);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "validatorL1Votes",
    ]);
    v.parse(ValidatorL1VotesRequest, data);
  },
});
