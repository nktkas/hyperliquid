import * as v from "@valibot/valibot";
import { type MetaAndAssetCtxsParameters, MetaAndAssetCtxsRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/metaAndAssetCtxs.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "MetaAndAssetCtxsResponse");
const paramsSchema = valibotToJsonSchema(v.omit(MetaAndAssetCtxsRequest, ["type"]));

runTest({
  name: "metaAndAssetCtxs",
  codeTestFn: async (_t, client) => {
    const params: MetaAndAssetCtxsParameters[] = [
      {},
      { dex: "gato" },
      { dex: "meng" },
    ];

    const data = await Promise.all(params.map((p) => client.metaAndAssetCtxs(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
  },
});
