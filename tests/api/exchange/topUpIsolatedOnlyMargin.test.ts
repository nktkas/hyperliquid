import {
  type TopUpIsolatedOnlyMarginParameters,
  TopUpIsolatedOnlyMarginRequest,
} from "@nktkas/hyperliquid/api/exchange";
import * as v from "@valibot/valibot";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { openOrder, runTest, symbolConverter, topUpPerp } from "./_t.ts";

const sourceFile = new URL("../../../src/api/exchange/_methods/topUpIsolatedOnlyMargin.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "TopUpIsolatedOnlyMarginSuccessResponse");
const paramsSchema = valibotToJsonSchema(
  v.omit(v.object(TopUpIsolatedOnlyMarginRequest.entries.action.entries), ["type"]),
);

runTest({
  name: "topUpIsolatedOnlyMargin",
  codeTestFn: async (_t, exchClient) => {
    // Use a strictIsolated asset
    const id = symbolConverter.getAssetId("ANIME")!;
    await topUpPerp(exchClient, "30");
    await openOrder(exchClient, "market", "ANIME");

    const params: TopUpIsolatedOnlyMarginParameters[] = [
      { asset: id, leverage: "0.5" },
    ];

    const data = await Promise.all(params.map((p) => exchClient.topUpIsolatedOnlyMargin(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
  },
});
