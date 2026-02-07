import * as v from "@valibot/valibot";
import { LeadingVaultsRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/leadingVaults.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "LeadingVaultsResponse");

runTest({
  name: "leadingVaults",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.leadingVaults({ user: "0xe019d6167E7e324aEd003d94098496b6d986aB05" }),
    ]);
    schemaCoverage(typeSchema, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "leadingVaults",
      "--user=0xe019d6167E7e324aEd003d94098496b6d986aB05",
    ]);
    v.parse(LeadingVaultsRequest, data);
  },
});
