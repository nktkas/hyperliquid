import { OrderUpdatesEvent } from "@nktkas/hyperliquid/api/subscription";
import { getWalletAddress } from "@nktkas/hyperliquid/signing";
import { collectEventsOverTime, openOrder, runTestWithExchange } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverageHyperliquid.ts";

runTestWithExchange({
  name: "orderUpdates",
  fn: async (_t, client) => {
    const data = await collectEventsOverTime<OrderUpdatesEvent>(async (cb) => {
      const user = await getWalletAddress(
        "multiSigUser" in client.exch.config_ ? client.exch.config_.signers[0] : client.exch.config_.wallet,
      );
      await client.subs.orderUpdates({ user }, cb);
      await openOrder(client.exch, "limit");
    }, 10_000);
    schemaCoverage(OrderUpdatesEvent, data, [
      "#/items/properties/order/properties/side/picklist/1",
      "#/items/properties/order/properties/cloid/undefined",
      "#/items/properties/order/properties/reduceOnly/defined",
      "#/items/properties/status/picklist/1",
      "#/items/properties/status/picklist/2",
      "#/items/properties/status/picklist/3",
      "#/items/properties/status/picklist/4",
      "#/items/properties/status/picklist/5",
      "#/items/properties/status/picklist/6",
      "#/items/properties/status/picklist/7",
      "#/items/properties/status/picklist/8",
      "#/items/properties/status/picklist/9",
      "#/items/properties/status/picklist/10",
      "#/items/properties/status/picklist/11",
      "#/items/properties/status/picklist/12",
      "#/items/properties/status/picklist/13",
      "#/items/properties/status/picklist/14",
      "#/items/properties/status/picklist/15",
      "#/items/properties/status/picklist/16",
      "#/items/properties/status/picklist/17",
      "#/items/properties/status/picklist/18",
      "#/items/properties/status/picklist/19",
      "#/items/properties/status/picklist/20",
      "#/items/properties/status/picklist/21",
      "#/items/properties/status/picklist/22",
      "#/items/properties/status/picklist/23",
      "#/items/properties/status/picklist/24",
      "#/items/properties/status/picklist/25",
      "#/items/properties/status/picklist/26",
      "#/items/properties/status/picklist/27",
      "#/items/properties/status/picklist/28",
    ]);
  },
});
