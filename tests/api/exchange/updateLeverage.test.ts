import * as v from "@valibot/valibot";
import { type UpdateLeverageParameters, UpdateLeverageRequest } from "@nktkas/hyperliquid/api/exchange";
import { runTest, symbolConverter } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/exchange/_methods/updateLeverage.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "UpdateLeverageSuccessResponse");
const paramsSchema = valibotToJsonSchema(v.omit(v.object(UpdateLeverageRequest.entries.action.entries), ["type"]));

runTest({
  name: "updateLeverage",
  codeTestFn: async (_t, exchClient) => {
    const params: UpdateLeverageParameters[] = [
      // isCross=true
      { asset: symbolConverter.getAssetId("SOL")!, isCross: true, leverage: 1 },
      // isCross=false
      { asset: symbolConverter.getAssetId("SOL")!, isCross: false, leverage: 1 },
    ];

    const data = await Promise.all(params.map((p) => exchClient.updateLeverage(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
  },
});
