import { parser, SuccessResponse, UpdateLeverageRequest } from "@nktkas/hyperliquid/api/exchange";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { getAssetData, runTest } from "./_t.ts";

runTest({
  name: "updateLeverage",
  codeTestFn: async (_t, clients) => {
    // —————————— Prepare ——————————

    const { id } = await getAssetData("BTC");

    // —————————— Test ——————————

    const data = await Promise.all([
      clients.exchange.updateLeverage({ asset: id, isCross: true, leverage: 1 }),
    ]);
    schemaCoverage(SuccessResponse, data);
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
    parser(UpdateLeverageRequest)(JSON.parse(data));
  },
});
