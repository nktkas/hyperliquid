import * as v from "@valibot/valibot";
import { PerpDexStatusRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/perpDexStatus.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "PerpDexStatusResponse");

runTest({
  name: "perpDexStatus",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.perpDexStatus({ dex: "test" }),
    ]);
    schemaCoverage(typeSchema, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "perpDexStatus",
      "--dex=test",
    ]);
    v.parse(PerpDexStatusRequest, data);
  },
});
