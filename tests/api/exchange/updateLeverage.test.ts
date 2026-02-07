import * as v from "@valibot/valibot";
import { UpdateLeverageRequest } from "@nktkas/hyperliquid/api/exchange";
import { runTest, symbolConverter } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/exchange/_methods/updateLeverage.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "UpdateLeverageSuccessResponse");

runTest({
  name: "updateLeverage",
  codeTestFn: async (_t, exchClient) => {
    const data = await Promise.all([
      exchClient.updateLeverage({
        asset: symbolConverter.getAssetId("SOL")!,
        isCross: true,
        leverage: 1,
      }),
    ]);
    schemaCoverage(typeSchema, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "updateLeverage",
      "--asset=0",
      "--isCross=true",
      "--leverage=1",
    ]);
    v.parse(UpdateLeverageRequest, data);
  },
});
