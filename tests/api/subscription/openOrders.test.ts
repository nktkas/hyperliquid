import {
  type OpenOrdersEvent,
  type OpenOrdersParameters,
  OpenOrdersRequest,
} from "@nktkas/hyperliquid/api/subscription";
import * as v from "@valibot/valibot";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { collectEventsOverTime, runTest } from "./_t.ts";

const sourceFile = new URL("../../../src/api/subscription/_methods/openOrders.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "OpenOrdersEvent");
const paramsSchema = valibotToJsonSchema(v.omit(OpenOrdersRequest, ["type"]));

runTest({
  name: "openOrders",
  mode: "api",
  fn: async (_t, client) => {
    const params: OpenOrdersParameters[] = [
      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" },
      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", dex: "" },
    ];

    const data = await collectEventsOverTime<OpenOrdersEvent>(async (cb) => {
      await Promise.all(params.map((p) => client.openOrders(p, cb)));
    }, 10_000);

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data, [
      "#/properties/orders/items/properties/orderType/enum/0",
      "#/properties/orders/items/properties/orderType/enum/4",
      "#/properties/orders/items/properties/orderType/enum/5",
      "#/properties/orders/items/properties/tif/enum/1",
      "#/properties/orders/items/properties/tif/enum/3",
      "#/properties/orders/items/properties/tif/enum/4",
      "#/properties/orders/items/properties/tif/enum/5",
      "#/properties/orders/items/properties/cloid/defined",
    ]);
  },
});
