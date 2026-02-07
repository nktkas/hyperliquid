import * as v from "@valibot/valibot";
import { MetaRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/meta.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "MetaResponse");

runTest({
  name: "meta",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.meta(),
      client.meta({ dex: "gato" }),
      client.meta({ dex: "meng" }),
    ]);
    schemaCoverage(typeSchema, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "meta",
    ]);
    v.parse(MetaRequest, data);
  },
});
