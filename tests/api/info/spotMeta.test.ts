import * as v from "@valibot/valibot";
import { SpotMetaRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/spotMeta.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "SpotMetaResponse");

runTest({
  name: "spotMeta",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.spotMeta(),
    ]);
    schemaCoverage(typeSchema, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "spotMeta",
    ]);
    v.parse(SpotMetaRequest, data);
  },
});
