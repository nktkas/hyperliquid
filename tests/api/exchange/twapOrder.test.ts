import * as v from "@valibot/valibot";
import { type TwapOrderParameters, TwapOrderRequest } from "@nktkas/hyperliquid/api/exchange";
import { formatSize } from "@nktkas/hyperliquid/utils";
import { allMids, runTest, symbolConverter, topUpPerp } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/exchange/_methods/twapOrder.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "TwapOrderSuccessResponse");
const paramsSchema = valibotToJsonSchema(v.omit(v.object(TwapOrderRequest.entries.action.entries), ["type"]));

runTest({
  name: "twapOrder",
  codeTestFn: async (_t, exchClient) => {
    await topUpPerp(exchClient, "130");

    const id = symbolConverter.getAssetId("SOL")!;
    const szDecimals = symbolConverter.getSzDecimals("SOL")!;
    const midPx = allMids["SOL"];

    const sz = formatSize(60 / parseFloat(midPx), szDecimals);

    const params: TwapOrderParameters[] = [
      // b=true | r=false | t=false
      { twap: { a: id, b: true, s: sz, r: false, m: 5, t: false } },
      // b=false | t=true
      { twap: { a: id, b: false, s: sz, r: false, m: 5, t: true } },
    ];

    const data = await Promise.all(params.map((p) => exchClient.twapOrder(p)));

    schemaCoverage(paramsSchema, params, [
      "#/properties/twap/properties/r/boolean/true", // r=true requires existing position
    ]);
    schemaCoverage(responseSchema, data);
  },
});
