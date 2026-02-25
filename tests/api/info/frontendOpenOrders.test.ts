import { type FrontendOpenOrdersParameters, FrontendOpenOrdersRequest } from "@nktkas/hyperliquid/api/info";
import * as v from "@valibot/valibot";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { runTest } from "./_t.ts";

const sourceFile = new URL("../../../src/api/info/_methods/frontendOpenOrders.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "FrontendOpenOrdersResponse");
const paramsSchema = valibotToJsonSchema(v.omit(FrontendOpenOrdersRequest, ["type"]));

runTest({
  name: "frontendOpenOrders",
  codeTestFn: async (_t, client) => {
    const params: FrontendOpenOrdersParameters[] = [
      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" },
      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", dex: "gato" },
    ];

    const data = await Promise.all(params.map((p) => client.frontendOpenOrders(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data, [
      "#/items/properties/orderType/enum/0",
      "#/items/properties/orderType/enum/4",
      "#/items/properties/orderType/enum/5",
      "#/items/properties/tif/enum/1",
      "#/items/properties/tif/enum/3",
      "#/items/properties/tif/enum/4",
      "#/items/properties/tif/enum/5",
      "#/items/properties/cloid/defined",
    ]);
  },
});
