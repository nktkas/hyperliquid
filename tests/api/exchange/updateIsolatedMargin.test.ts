import { parser, UpdateIsolatedMarginRequest, UpdateIsolatedMarginResponse } from "../../../src/api/exchange/~mod.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { excludeErrorResponse, openOrder, runTest, symbolConverter } from "./_t.ts";

runTest({
  name: "updateIsolatedMargin",
  codeTestFn: async (t, exchClient) => {
    // —————————— Prepare ——————————

    const id = symbolConverter.getAssetId("ETH")!;
    await exchClient.updateLeverage({ asset: id, isCross: false, leverage: 1 });
    await openOrder(exchClient, "market", "ETH");

    // —————————— Test ——————————

    await t.test("Increase isolated margin", async () => {
      const data = await Promise.all([
        exchClient.updateIsolatedMargin({ asset: id, isBuy: true, ntli: 2 * 1e6 }),
      ]);
      schemaCoverage(excludeErrorResponse(UpdateIsolatedMarginResponse), data);
    });

    await t.test("Decrease isolated margin", async () => {
      const data = await Promise.all([
        exchClient.updateIsolatedMargin({ asset: id, isBuy: true, ntli: -1 * 1e6 }),
      ]);
      schemaCoverage(excludeErrorResponse(UpdateIsolatedMarginResponse), data);
    });
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "updateIsolatedMargin",
      "--asset",
      "0",
      "--isBuy",
      "true",
      "--ntli",
      "1",
    ]);
    parser(UpdateIsolatedMarginRequest)(data);
  },
});
