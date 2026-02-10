import * as v from "@valibot/valibot";
import { type HistoricalOrdersParameters, HistoricalOrdersRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/historicalOrders.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "HistoricalOrdersResponse");
const paramsSchema = valibotToJsonSchema(v.omit(HistoricalOrdersRequest, ["type"]));

runTest({
  name: "historicalOrders",
  codeTestFn: async (_t, client) => {
    const params: HistoricalOrdersParameters[] = [
      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" },
    ];

    const data = await Promise.all(params.map((p) => client.historicalOrders(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data, [
      "#/items/properties/order/properties/tif/enum/5",
      "#/items/properties/status/enum/5",
      "#/items/properties/status/enum/6",
      "#/items/properties/status/enum/7",
      "#/items/properties/status/enum/8",
      "#/items/properties/status/enum/10",
      "#/items/properties/status/enum/11",
      "#/items/properties/status/enum/12",
      "#/items/properties/status/enum/13",
      "#/items/properties/status/enum/14",
      "#/items/properties/status/enum/15",
      "#/items/properties/status/enum/16",
      "#/items/properties/status/enum/17",
      "#/items/properties/status/enum/18",
      "#/items/properties/status/enum/19",
      "#/items/properties/status/enum/20",
      "#/items/properties/status/enum/21",
      "#/items/properties/status/enum/22",
      "#/items/properties/status/enum/23",
      "#/items/properties/status/enum/24",
      "#/items/properties/status/enum/25",
      "#/items/properties/status/enum/26",
      "#/items/properties/status/enum/27",
      "#/items/properties/status/enum/28",
    ]);
  },
});
