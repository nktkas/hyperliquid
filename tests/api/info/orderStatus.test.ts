import * as v from "@valibot/valibot";
import { OrderStatusRequest, OrderStatusResponse } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverageHyperliquid.ts";

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
    schemaCoverage(OrderStatusResponse, data, [
      "#/variant/0/properties/order/properties/order/properties/children/array",
      "#/variant/0/properties/order/properties/status/picklist/3",
      "#/variant/0/properties/order/properties/status/picklist/5",
      "#/variant/0/properties/order/properties/status/picklist/6",
      "#/variant/0/properties/order/properties/status/picklist/7",
      "#/variant/0/properties/order/properties/status/picklist/8",
      "#/variant/0/properties/order/properties/status/picklist/10",
      "#/variant/0/properties/order/properties/status/picklist/11",
      "#/variant/0/properties/order/properties/status/picklist/12",
      "#/variant/0/properties/order/properties/status/picklist/13",
      "#/variant/0/properties/order/properties/status/picklist/14",
      "#/variant/0/properties/order/properties/status/picklist/15",
      "#/variant/0/properties/order/properties/status/picklist/16",
      "#/variant/0/properties/order/properties/status/picklist/17",
      "#/variant/0/properties/order/properties/status/picklist/18",
      "#/variant/0/properties/order/properties/status/picklist/19",
      "#/variant/0/properties/order/properties/status/picklist/20",
      "#/variant/0/properties/order/properties/status/picklist/21",
      "#/variant/0/properties/order/properties/status/picklist/22",
      "#/variant/0/properties/order/properties/status/picklist/23",
      "#/variant/0/properties/order/properties/status/picklist/24",
      "#/variant/0/properties/order/properties/status/picklist/25",
      "#/variant/0/properties/order/properties/status/picklist/26",
      "#/variant/0/properties/order/properties/status/picklist/27",
      "#/variant/0/properties/order/properties/status/picklist/28",
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
