import * as v from "@valibot/valibot";
import { DelegatorSummaryRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/delegatorSummary.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "DelegatorSummaryResponse");

runTest({
  name: "delegatorSummary",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.delegatorSummary({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }),
    ]);
    schemaCoverage(typeSchema, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "delegatorSummary",
      "--user=0x563C175E6f11582f65D6d9E360A618699DEe14a9",
    ]);
    v.parse(DelegatorSummaryRequest, data);
  },
});
