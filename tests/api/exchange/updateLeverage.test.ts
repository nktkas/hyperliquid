import * as v from "@valibot/valibot";
import { UpdateLeverageRequest, UpdateLeverageResponse } from "@nktkas/hyperliquid/api/exchange";
import { excludeErrorResponse, runTest, symbolConverter } from "./_t.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";

runTest({
  name: "updateLeverage",
  codeTestFn: async (_t, exchClient) => {
    const data = await Promise.all([
      exchClient.updateLeverage({
        asset: symbolConverter.getAssetId("ETH")!,
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
