import { UserHistoricalOrdersEvent } from "@nktkas/hyperliquid/api/subscription";
import { collectEventsOverTime, runTest } from "./_t.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";

runTest({
  name: "userHistoricalOrders",
  mode: "api",
  fn: async (_t, client) => {
    const data = await collectEventsOverTime<UserHistoricalOrdersEvent>(async (cb) => {
      await client.userHistoricalOrders({ user: "0xe019d6167E7e324aEd003d94098496b6d986aB05" }, cb);
      await client.userHistoricalOrders({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }, cb);
    }, 10_000);
    schemaCoverage(UserHistoricalOrdersEvent, data, {
      ignoreEmptyArray: ["#/properties/orderHistory/items/properties/order/properties/children"],
      ignorePicklistValues: {
        "#/properties/orderHistory/items/properties/order/properties/orderType": [
          "Stop Limit",
        ],
        "#/properties/orderHistory/items/properties/order/properties/tif/wrapped": [
          "LiquidationMarket",
        ],
        "#/properties/orderHistory/items/properties/status": [
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
      },
      ignoreUndefinedTypes: ["#/properties/isSnapshot"],
    });
  },
});
