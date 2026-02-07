import * as v from "@valibot/valibot";
import { PerpDexLimitsRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/perpDexLimits.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "PerpDexLimitsResponse");

runTest({
  name: "perpDexLimits",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.perpDexLimits({ dex: "" }),
      client.perpDexLimits({ dex: "vntls" }),
    ]);
    schemaCoverage(typeSchema, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "perpDexLimits",
      "--dex=vntls",
    ]);
    v.parse(PerpDexLimitsRequest, data);
  },
});
