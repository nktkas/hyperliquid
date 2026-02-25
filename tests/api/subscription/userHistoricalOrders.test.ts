import {
  type UserHistoricalOrdersEvent,
  type UserHistoricalOrdersParameters,
  UserHistoricalOrdersRequest,
} from "@nktkas/hyperliquid/api/subscription";
import * as v from "@valibot/valibot";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { collectEventsOverTime, runTest } from "./_t.ts";

const sourceFile = new URL("../../../src/api/subscription/_methods/userHistoricalOrders.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "UserHistoricalOrdersEvent");
const paramsSchema = valibotToJsonSchema(v.omit(UserHistoricalOrdersRequest, ["type"]));

runTest({
  name: "userHistoricalOrders",
  mode: "api",
  fn: async (_t, client) => {
    const params: UserHistoricalOrdersParameters[] = [
      { user: "0xe019d6167E7e324aEd003d94098496b6d986aB05" },
      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" },
    ];

    const data = await collectEventsOverTime<UserHistoricalOrdersEvent>(async (cb) => {
      await Promise.all(params.map((p) => client.userHistoricalOrders(p, cb)));
    }, 10_000);

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data, [
      "#/properties/orderHistory/items/properties/order/properties/orderType/enum/3",
      "#/properties/orderHistory/items/properties/order/properties/tif/enum/5",
      "#/properties/orderHistory/items/properties/status/enum/4",
      "#/properties/orderHistory/items/properties/status/enum/5",
      "#/properties/orderHistory/items/properties/status/enum/6",
      "#/properties/orderHistory/items/properties/status/enum/7",
      "#/properties/orderHistory/items/properties/status/enum/8",
      "#/properties/orderHistory/items/properties/status/enum/10",
      "#/properties/orderHistory/items/properties/status/enum/11",
      "#/properties/orderHistory/items/properties/status/enum/12",
      "#/properties/orderHistory/items/properties/status/enum/13",
      "#/properties/orderHistory/items/properties/status/enum/14",
      "#/properties/orderHistory/items/properties/status/enum/15",
      "#/properties/orderHistory/items/properties/status/enum/16",
      "#/properties/orderHistory/items/properties/status/enum/17",
      "#/properties/orderHistory/items/properties/status/enum/18",
      "#/properties/orderHistory/items/properties/status/enum/19",
      "#/properties/orderHistory/items/properties/status/enum/20",
      "#/properties/orderHistory/items/properties/status/enum/21",
      "#/properties/orderHistory/items/properties/status/enum/22",
      "#/properties/orderHistory/items/properties/status/enum/23",
      "#/properties/orderHistory/items/properties/status/enum/24",
      "#/properties/orderHistory/items/properties/status/enum/25",
      "#/properties/orderHistory/items/properties/status/enum/26",
      "#/properties/orderHistory/items/properties/status/enum/27",
      "#/properties/orderHistory/items/properties/status/enum/28",
      "#/properties/isSnapshot/missing",
    ]);
  },
});
