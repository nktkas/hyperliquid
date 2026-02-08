import * as v from "@valibot/valibot";
import {
  type OrderUpdatesEvent,
  type OrderUpdatesParameters,
  OrderUpdatesRequest,
} from "@nktkas/hyperliquid/api/subscription";
import { getWalletAddress } from "@nktkas/hyperliquid/signing";
import { collectEventsOverTime, openOrder, runTestWithExchange } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/subscription/_methods/orderUpdates.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "OrderUpdatesEvent");
const paramsSchema = valibotToJsonSchema(v.omit(OrderUpdatesRequest, ["type"]));

runTestWithExchange({
  name: "orderUpdates",
  fn: async (_t, client) => {
    const user = await getWalletAddress(
      "multiSigUser" in client.exch.config_ ? client.exch.config_.signers[0] : client.exch.config_.wallet,
    );
    const params: OrderUpdatesParameters[] = [{ user }];

    const data = await collectEventsOverTime<OrderUpdatesEvent>(async (cb) => {
      await Promise.all(params.map((p) => client.subs.orderUpdates(p, cb)));
      await openOrder(client.exch, "limit");
    }, 10_000);

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data, [
      "#/items/properties/order/properties/side/enum/1",
      "#/items/properties/order/properties/cloid/missing",
      "#/items/properties/order/properties/reduceOnly/present",
      "#/items/properties/status/enum/1",
      "#/items/properties/status/enum/2",
      "#/items/properties/status/enum/3",
      "#/items/properties/status/enum/4",
      "#/items/properties/status/enum/5",
      "#/items/properties/status/enum/6",
      "#/items/properties/status/enum/7",
      "#/items/properties/status/enum/8",
      "#/items/properties/status/enum/9",
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
