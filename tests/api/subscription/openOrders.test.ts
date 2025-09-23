// deno-lint-ignore-file no-import-prefix
import { OpenOrdersEvent } from "@nktkas/hyperliquid/api/subscription";
import { deadline } from "jsr:@std/async@1/deadline";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest("openOrders", "api", async (_t, client) => {
  const data = await Promise.all([
    deadline(
      new Promise<OpenOrdersEvent>((resolve) => {
        client.openOrders({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }, resolve);
      }),
      10_000,
    ),
  ]);
  schemaCoverage(OpenOrdersEvent, data, {
    ignoreBranches: {
      "#/properties/orders/items/properties/orderType": [0, 4, 5],
      "#/properties/orders/items/properties/tif/union/0": [1, 3, 4],
    },
  });
});
