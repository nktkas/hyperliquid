import * as v from "@valibot/valibot";
import { MarginTableRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/marginTable.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "MarginTableResponse");

runTest({
  name: "marginTable",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.marginTable({ id: 1 }),
    ]);
    schemaCoverage(typeSchema, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "marginTable",
      "--id=1",
    ]);
    v.parse(MarginTableRequest, data);
  },
});
