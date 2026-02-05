import * as v from "@valibot/valibot";
import { UpdateLeverageRequest, UpdateLeverageResponse } from "@nktkas/hyperliquid/api/exchange";
import { runTest, symbolConverter } from "./_t.ts";
import { excludeErrorResponse, schemaCoverage } from "../_utils/schemaCoverageHyperliquid.ts";

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
    schemaCoverage(excludeErrorResponse(UpdateLeverageResponse), data);
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
