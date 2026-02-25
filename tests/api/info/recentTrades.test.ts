import { type RecentTradesParameters, RecentTradesRequest } from "@nktkas/hyperliquid/api/info";
import * as v from "@valibot/valibot";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { runTest } from "./_t.ts";

const sourceFile = new URL("../../../src/api/info/_methods/recentTrades.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "RecentTradesResponse");
const paramsSchema = valibotToJsonSchema(v.omit(RecentTradesRequest, ["type"]));

runTest({
  name: "recentTrades",
  codeTestFn: async (_t, client) => {
    const params: RecentTradesParameters[] = [
      { coin: "ETH" },
    ];

    const data = await Promise.all(params.map((p) => client.recentTrades(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data, [
      "#/items/properties/side/enum/0",
      "#/items/properties/side/enum/1",
    ]);
  },
});
