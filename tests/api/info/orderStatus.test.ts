import { OrderStatusRequest, OrderStatusResponse, parser } from "@nktkas/hyperliquid/api/info";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

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
    schemaCoverage(OrderStatusResponse, data, {
      ignoreEmptyArray: ["#/union/0/properties/order/properties/order/properties/children"],
      ignoreBranches: {
        "#/union/0/properties/order/properties/status": [3, 5, 6, 7, 8, 10, 11, 12, 13, 14],
      },
    });
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "orderStatus",
      "--user",
      "0x563C175E6f11582f65D6d9E360A618699DEe14a9",
      "--oid",
      "27379010444",
    ]);
    parser(OrderStatusRequest)(JSON.parse(data));
  },
});
