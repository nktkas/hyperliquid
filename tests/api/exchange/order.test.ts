import * as v from "@valibot/valibot";
import { OrderRequest, OrderResponse } from "@nktkas/hyperliquid/api/exchange";
import { formatPrice, formatSize } from "@nktkas/hyperliquid/utils";
import { allMids, excludeErrorResponse, runTest, symbolConverter, topUpPerp } from "./_t.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";

runTest({
  name: "order",
  codeTestFn: async (_t, exchClient) => {
    // ========== Prepare ==========

    await topUpPerp(exchClient, "20");

    const id = symbolConverter.getAssetId("ETH")!;
    const szDecimals = symbolConverter.getSzDecimals("ETH")!;
    const midPx = allMids["ETH"];

    const pxUp = formatPrice(parseFloat(midPx) * 1.05, szDecimals);
    const pxDown = formatPrice(parseFloat(midPx) * 0.95, szDecimals);
    const sz = formatSize(15 / parseFloat(midPx), szDecimals);

    // ========== Test ==========

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
          c: "0x17a5a40306205a0c6d60c7264153781c",
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
          c: "0x17a5a40306205a0c6d60c7264153781c",
        }],
        grouping: "na",
      }),
      // waitingForTrigger
      exchClient.order({
        orders: [
          {
            a: id,
            b: false,
            p: pxDown,
            s: sz,
            r: false,
            t: { limit: { tif: "Gtc" } },
          },
          {
            a: id,
            b: true,
            p: pxDown,
            s: sz,
            r: true,
            t: {
              trigger: {
                isMarket: true,
                tpsl: "tp",
                triggerPx: pxUp,
              },
            },
          },
        ],
        grouping: "normalTpsl",
      }),
    ]);
    schemaCoverage(excludeErrorResponse(OrderResponse), data, {
      ignoreBranches: {
        "#/properties/response/properties/data/properties/statuses/items": [2],
      },
    });
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "order",
      `--orders=${
        JSON.stringify([{
          a: 0,
          b: true,
          p: "1",
          s: "1",
          r: false,
          t: { limit: { tif: "Gtc" } },
        }])
      }`,
    ]);
    v.parse(OrderRequest, data);
  },
});
