import * as v from "@valibot/valibot";
import { MetaAndAssetCtxsRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/metaAndAssetCtxs.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "MetaAndAssetCtxsResponse");

runTest({
  name: "metaAndAssetCtxs",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.metaAndAssetCtxs(),
      client.metaAndAssetCtxs({ dex: "gato" }),
      client.metaAndAssetCtxs({ dex: "meng" }),
    ]);
    schemaCoverage(typeSchema, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "metaAndAssetCtxs",
    ]);
    v.parse(MetaAndAssetCtxsRequest, data);
  },
});
