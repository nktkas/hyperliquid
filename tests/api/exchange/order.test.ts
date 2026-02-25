import { type OrderParameters, OrderRequest } from "@nktkas/hyperliquid/api/exchange";
import { formatPrice, formatSize } from "@nktkas/hyperliquid/utils";
import * as v from "@valibot/valibot";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { allMids, runTest, symbolConverter, topUpPerp } from "./_t.ts";

const sourceFile = new URL("../../../src/api/exchange/_methods/order.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "OrderSuccessResponse");
const paramsSchema = valibotToJsonSchema(v.omit(v.object(OrderRequest.entries.action.entries), ["type"]));

runTest({
  name: "order",
  codeTestFn: async (_t, exchClient) => {
    await topUpPerp(exchClient, "80");
    await exchClient.approveBuilderFee({
      maxFeeRate: "0.001%",
      builder: "0xe019d6167E7e324aEd003d94098496b6d986aB05",
    });

    const id = symbolConverter.getAssetId("SOL")!;
    const szDecimals = symbolConverter.getSzDecimals("SOL")!;
    const midPx = allMids["SOL"];

    const pxUp = formatPrice(parseFloat(midPx) * 1.05, szDecimals);
    const pxDown = formatPrice(parseFloat(midPx) * 0.95, szDecimals);
    const sz = formatSize(15 / parseFloat(midPx), szDecimals);

    const params: OrderParameters[] = [
      // resting | limit | Gtc | no cloid | grouping=default
      {
        orders: [{ a: id, b: true, p: pxDown, s: sz, r: false, t: { limit: { tif: "Gtc" } } }],
      },
      // resting | limit | Alo | cloid
      {
        orders: [{
          a: id,
          b: true,
          p: pxDown,
          s: sz,
          r: false,
          t: { limit: { tif: "Alo" } },
          c: "0x17a5a40306205a0c6d60c7264153781c",
        }],
        grouping: "na",
      },
      // filled | limit | Ioc | cloid
      {
        orders: [{
          a: id,
          b: true,
          p: pxUp,
          s: sz,
          r: false,
          t: { limit: { tif: "Ioc" } },
          c: "0x27a5a40306205a0c6d60c7264153781c",
        }],
        grouping: "na",
      },
      // filled | limit | FrontendMarket | b=false | builder
      {
        orders: [{ a: id, b: false, p: pxDown, s: sz, r: false, t: { limit: { tif: "FrontendMarket" } } }],
        grouping: "na",
        builder: { b: "0xe019d6167E7e324aEd003d94098496b6d986aB05", f: 1 },
      },
      // trigger | tp | isMarket=true | r=true | normalTpsl
      {
        orders: [
          { a: id, b: false, p: pxDown, s: sz, r: false, t: { limit: { tif: "Gtc" } } },
          {
            a: id,
            b: true,
            p: pxDown,
            s: sz,
            r: true,
            t: { trigger: { isMarket: true, tpsl: "tp", triggerPx: pxUp } },
          },
        ],
        grouping: "normalTpsl",
      },
      // trigger | sl | isMarket=false | positionTpsl
      {
        orders: [{
          a: id,
          b: false,
          p: pxUp,
          s: sz,
          r: true,
          t: { trigger: { isMarket: false, tpsl: "sl", triggerPx: pxDown } },
        }],
        grouping: "positionTpsl",
      },
    ];

    const data = await Promise.all(params.map((p) => exchClient.order(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data, [
      "#/properties/response/properties/data/properties/statuses/items/anyOf/2", // "waitingForFill"
    ]);
  },
});
