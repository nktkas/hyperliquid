import * as v from "@valibot/valibot";
import { DelegatorHistoryRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/delegatorHistory.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "DelegatorHistoryResponse");

runTest({
  name: "delegatorHistory",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.delegatorHistory({ user: "0xedc88158266c50628a9ffbaa1db2635376577eea" }),
    ]);
    schemaCoverage(typeSchema, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "delegatorHistory",
      "--user=0xedc88158266c50628a9ffbaa1db2635376577eea",
    ]);
    v.parse(DelegatorHistoryRequest, data);
  },
});
