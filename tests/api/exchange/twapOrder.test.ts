import { parser, TwapOrderRequest, TwapOrderSuccessResponse } from "@nktkas/hyperliquid/api/exchange";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { allMids, formatSize, runTest, symbolConverter } from "./_t.ts";

runTest({
  name: "twapOrder",
  codeTestFn: async (_t, exchClient) => {
    // —————————— Prepare ——————————

    const id = symbolConverter.getAssetId("ETH")!;
    const szDecimals = symbolConverter.getSzDecimals("ETH")!;
    const midPx = allMids["ETH"];

    const sz = formatSize(60 / parseFloat(midPx), szDecimals);

    // —————————— Test ——————————

    const data = await Promise.all([
      exchClient.twapOrder({
        twap: {
          a: id,
          b: true,
          s: sz,
          r: false,
          m: 5,
          t: false,
        },
      }),
    ]);
    schemaCoverage(TwapOrderSuccessResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "twapOrder",
      "--a",
      "0",
      "--b",
      "true",
      "--s",
      "0",
      "--r",
      "false",
      "--m",
      "5",
      "--t",
      "false",
    ]);
    parser(TwapOrderRequest)(data);
  },
});
