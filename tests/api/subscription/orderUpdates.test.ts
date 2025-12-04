import { OrderUpdatesEvent } from "@nktkas/hyperliquid/api/subscription";
import { getWalletAddress } from "@nktkas/hyperliquid/signing";
import { collectEventsOverTime, openOrder, runTestWithExchange } from "./_t.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";

runTestWithExchange({
  name: "orderUpdates",
  fn: async (_t, client) => {
    const data = await collectEventsOverTime<OrderUpdatesEvent>(async (cb) => {
      const user = await getWalletAddress(
        "multiSigUser" in client.exch.config_ ? client.exch.config_.wallet[0] : client.exch.config_.wallet,
      );
      await client.subs.orderUpdates({ user }, cb);
      await openOrder(client.exch, "limit");
    }, 10_000);
    schemaCoverage(OrderUpdatesEvent, data, {
      ignorePicklistValues: {
        "#/items/properties/status": [
          "filled",
          "canceled",
          "triggered",
          "rejected",
          "reduceOnlyCanceled",
          "marginCanceled",
          "vaultWithdrawalCanceled",
          "openInterestCapCanceled",
          "selfTradeCanceled",
          "siblingFilledCanceled",
          "delistedCanceled",
          "liquidatedCanceled",
          "scheduledCancel",
          "tickRejected",
          "minTradeNtlRejected",
          "perpMarginRejected",
          "reduceOnlyRejected",
          "badAloPxRejected",
          "iocCancelRejected",
          "badTriggerPxRejected",
          "marketOrderNoLiquidityRejected",
          "positionIncreaseAtOpenInterestCapRejected",
          "positionFlipAtOpenInterestCapRejected",
          "tooAggressiveAtOpenInterestCapRejected",
          "openInterestIncreaseRejected",
          "insufficientSpotBalanceRejected",
          "oracleRejected",
          "perpMaxPositionRejected",
        ],
        "#/items/properties/order/properties/side": ["A"],
      },
      ignoreDefinedTypes: [
        "#/items/properties/order/properties/cloid",
        "#/items/properties/order/properties/reduceOnly",
      ],
      ignoreUndefinedTypes: [
        "#/items/properties/order/properties/cloid",
      ],
    });
  },
});
