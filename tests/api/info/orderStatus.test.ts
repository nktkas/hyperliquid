import * as v from "@valibot/valibot";
import { type OrderStatusParameters, OrderStatusRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/orderStatus.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "OrderStatusResponse");
const paramsSchema = valibotToJsonSchema(v.omit(OrderStatusRequest, ["type"]));

runTest({
  name: "orderStatus",
  codeTestFn: async (_t, client) => {
    const params: OrderStatusParameters[] = [
      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", oid: 0 }, // status = unknownOid

      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", oid: 27379010444 }, // order.order.side = A
      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", oid: 15029784876 }, // order.order.side = A

      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", oid: 15029784876 }, // order.order.orderType = Limit
      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", oid: 15030144135 }, // order.order.orderType = Stop Market
      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", oid: 14940693141 }, // order.order.orderType = Stop Limit
      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", oid: 27379010444 }, // order.order.orderType = Take Profit Market
      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", oid: 27379156434 }, // order.order.orderType = Take Profit Limit

      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", oid: 15030144135 }, // order.order.tif = null
      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", oid: 15029784876 }, // order.order.tif = Gtc
      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", oid: 14947967914 }, // order.order.tif = Alo
      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", oid: 23629760457 }, // order.order.tif = Ioc
      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", oid: 20776394366 }, // order.order.tif = FrontendMarket
      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", oid: 21904297440 }, // order.order.tif = LiquidationMarket

      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", oid: 27379010444 }, // order.status = open
      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", oid: 15029784876 }, // order.status = filled
      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", oid: 15030144135 }, // order.status = canceled
      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", oid: 20776394366 }, // order.status = rejected
      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", oid: 27378915177 }, // order.status = reduceOnlyRejected

      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", oid: 15548036277 }, // order.order.cloid = null
      { // order.order.cloid = hex
        user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9",
        oid: "0xd4bb069b673a48161bca56cfc88deb6b",
      },
    ];

    const data = await Promise.all(params.map((p) => client.orderStatus(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data, [
      "#/anyOf/0/properties/order/properties/order/properties/children/array",
      "#/anyOf/0/properties/order/properties/order/properties/tif/enum/5",
      "#/anyOf/0/properties/order/properties/status/enum/3",
      "#/anyOf/0/properties/order/properties/status/enum/5",
      "#/anyOf/0/properties/order/properties/status/enum/6",
      "#/anyOf/0/properties/order/properties/status/enum/7",
      "#/anyOf/0/properties/order/properties/status/enum/8",
      "#/anyOf/0/properties/order/properties/status/enum/10",
      "#/anyOf/0/properties/order/properties/status/enum/11",
      "#/anyOf/0/properties/order/properties/status/enum/12",
      "#/anyOf/0/properties/order/properties/status/enum/13",
      "#/anyOf/0/properties/order/properties/status/enum/14",
      "#/anyOf/0/properties/order/properties/status/enum/15",
      "#/anyOf/0/properties/order/properties/status/enum/16",
      "#/anyOf/0/properties/order/properties/status/enum/17",
      "#/anyOf/0/properties/order/properties/status/enum/18",
      "#/anyOf/0/properties/order/properties/status/enum/19",
      "#/anyOf/0/properties/order/properties/status/enum/20",
      "#/anyOf/0/properties/order/properties/status/enum/21",
      "#/anyOf/0/properties/order/properties/status/enum/22",
      "#/anyOf/0/properties/order/properties/status/enum/23",
      "#/anyOf/0/properties/order/properties/status/enum/24",
      "#/anyOf/0/properties/order/properties/status/enum/25",
      "#/anyOf/0/properties/order/properties/status/enum/26",
      "#/anyOf/0/properties/order/properties/status/enum/27",
      "#/anyOf/0/properties/order/properties/status/enum/28",
    ]);
  },
});
