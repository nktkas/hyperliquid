import { type ActiveAssetDataParameters, ActiveAssetDataRequest } from "@nktkas/hyperliquid/api/info";
import * as v from "@valibot/valibot";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { runTest } from "./_t.ts";

const sourceFile = new URL("../../../src/api/info/_methods/activeAssetData.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "ActiveAssetDataResponse");
const paramsSchema = valibotToJsonSchema(v.omit(ActiveAssetDataRequest, ["type"]));

runTest({
  name: "activeAssetData",
  codeTestFn: async (_t, client) => {
    const params: ActiveAssetDataParameters[] = [
      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", coin: "BTC" }, // leverage.type = isolated
      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", coin: "NEAR" }, // leverage.type = cross
    ];

    const data = await Promise.all(params.map((p) => client.activeAssetData(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
  },
});
