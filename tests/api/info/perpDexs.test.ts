import * as v from "@valibot/valibot";
import { PerpDexsRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/perpDexs.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "PerpDexsResponse");

runTest({
  name: "perpDexs",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([client.perpDexs()]);

    schemaCoverage(responseSchema, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "perpDexs",
    ]);
    v.parse(PerpDexsRequest, data);
  },
});
