import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { runTest } from "./_t.ts";

const sourceFile = new URL("../../../src/api/info/_methods/spotMetaAndAssetCtxs.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "SpotMetaAndAssetCtxsResponse");

runTest({
  name: "spotMetaAndAssetCtxs",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([client.spotMetaAndAssetCtxs()]);

    schemaCoverage(responseSchema, data, [
      "#/items/0/properties/outcomes/present",
      "#/items/0/properties/questions/present",
    ]);
  },
});
