import * as v from "@valibot/valibot";
import { VaultSummariesRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/vaultSummaries.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "VaultSummariesResponse");

runTest({
  name: "vaultSummaries",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([client.vaultSummaries()]);

    schemaCoverage(responseSchema, data, [
      "#/array",
    ]);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "vaultSummaries",
    ]);
    v.parse(VaultSummariesRequest, data);
  },
});
