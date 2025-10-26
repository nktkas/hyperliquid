import { OrderRequest, OrderSuccessResponse, parser } from "@nktkas/hyperliquid/api/exchange";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { allMids, formatPrice, formatSize, randomCloid, runTest, symbolConverter, topUpPerp } from "./_t.ts";

runTest({
  name: "order",
  codeTestFn: async (_t, exchClient) => {
    // —————————— Prepare ——————————

    await topUpPerp(exchClient, "20");

    const id = symbolConverter.getAssetId("ETH")!;
    const szDecimals = symbolConverter.getSzDecimals("ETH")!;
    const midPx = allMids["ETH"];

    const pxUp = formatPrice(parseFloat(midPx) * 1.05, szDecimals);
    const pxDown = formatPrice(parseFloat(midPx) * 0.95, szDecimals);
    const sz = formatSize(15 / parseFloat(midPx), szDecimals);

    // —————————— Test ——————————

    const data = await Promise.all([
      // resting
      exchClient.order({
        orders: [{
          a: id,
          b: true,
          p: pxDown,
          s: sz,
          r: false,
          t: { limit: { tif: "Gtc" } },
        }],
        grouping: "na",
      }),
      // resting | cloid
      exchClient.order({
        orders: [{
          a: id,
          b: true,
          p: pxDown,
          s: sz,
          r: false,
          t: { limit: { tif: "Gtc" } },
          c: randomCloid(),
        }],
        grouping: "na",
      }),
      // filled
      exchClient.order({
        orders: [{
          a: id,
          b: true,
          p: pxUp,
          s: sz,
          r: false,
          t: { limit: { tif: "Gtc" } },
        }],
        grouping: "na",
      }),
      // filled | cloid
      exchClient.order({
        orders: [{
          a: id,
          b: true,
          p: pxUp,
          s: sz,
          r: false,
          t: { limit: { tif: "Gtc" } },
          c: randomCloid(),
        }],
        grouping: "na",
      }),
    ]);
    schemaCoverage(OrderSuccessResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "order",
      "--orders",
      JSON.stringify([{
        a: 0,
        b: true,
        p: "1",
        s: "1",
        r: false,
        t: { limit: { tif: "Gtc" } },
      }]),
    ]);
    parser(OrderRequest)(data);
  },
});
