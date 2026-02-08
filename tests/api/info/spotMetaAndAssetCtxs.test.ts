import * as v from "@valibot/valibot";
import { SpotMetaAndAssetCtxsRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/spotMetaAndAssetCtxs.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "SpotMetaAndAssetCtxsResponse");

runTest({
  name: "spotMetaAndAssetCtxs",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([client.spotMetaAndAssetCtxs()]);

    schemaCoverage(responseSchema, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "spotMetaAndAssetCtxs",
    ]);
    v.parse(SpotMetaAndAssetCtxsRequest, data);
  },
});
