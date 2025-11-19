import { parser, UpdateLeverageRequest, UpdateLeverageResponse } from "../../../src/api/exchange/~mod.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { excludeErrorResponse, runTest, symbolConverter } from "./_t.ts";

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
      "--asset",
      "0",
      "--isCross",
      "true",
      "--leverage",
      "1",
    ]);
    parser(UpdateLeverageRequest)(data);
  },
});
