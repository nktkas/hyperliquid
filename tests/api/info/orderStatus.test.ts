import * as v from "@valibot/valibot";
import { OrderStatusRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/orderStatus.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "OrderStatusResponse");

runTest({
  name: "orderStatus",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.orderStatus({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", oid: 0 }), // status = unknownOid

      client.orderStatus({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", oid: 27379010444 }), // order.order.side = A
      client.orderStatus({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", oid: 15029784876 }), // order.order.side = A

      client.orderStatus({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", oid: 15029784876 }), // order.order.orderType = Limit
      client.orderStatus({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", oid: 15030144135 }), // order.order.orderType = Stop Market
      client.orderStatus({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", oid: 14940693141 }), // order.order.orderType = Stop Limit
      client.orderStatus({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", oid: 27379010444 }), // order.order.orderType = Take Profit Market
      client.orderStatus({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", oid: 27379156434 }), // order.order.orderType = Take Profit Limit

      client.orderStatus({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", oid: 15030144135 }), // order.order.tif = null
      client.orderStatus({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", oid: 15029784876 }), // order.order.tif = Gtc
      client.orderStatus({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", oid: 14947967914 }), // order.order.tif = Alo
      client.orderStatus({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", oid: 23629760457 }), // order.order.tif = Ioc
      client.orderStatus({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", oid: 20776394366 }), // order.order.tif = FrontendMarket
      client.orderStatus({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", oid: 21904297440 }), // order.order.tif = LiquidationMarket

      client.orderStatus({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", oid: 27379010444 }), // order.status = open
      client.orderStatus({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", oid: 15029784876 }), // order.status = filled
      client.orderStatus({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", oid: 15030144135 }), // order.status = canceled
      client.orderStatus({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", oid: 20776394366 }), // order.status = rejected
      client.orderStatus({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", oid: 27378915177 }), // order.status = reduceOnlyRejected

      client.orderStatus({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", oid: 15548036277 }), // order.order.cloid = null
      client.orderStatus({ // order.order.cloid = hex
        user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9",
        oid: "0xd4bb069b673a48161bca56cfc88deb6b",
      }),
    ]);
    schemaCoverage(typeSchema, data, [
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
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "orderStatus",
      "--user=0x563C175E6f11582f65D6d9E360A618699DEe14a9",
      "--oid=27379010444",
    ]);
    v.parse(OrderStatusRequest, data);
  },
});
