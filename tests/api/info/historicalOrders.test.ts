import * as v from "@valibot/valibot";
import { HistoricalOrdersRequest, HistoricalOrdersResponse } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";

runTest({
  name: "historicalOrders",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.historicalOrders({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }),
    ]);
    schemaCoverage(HistoricalOrdersResponse, data, {
      ignorePicklistValues: {
        "#/items/properties/status": [
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
    });
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "historicalOrders",
      "--user=0x563C175E6f11582f65D6d9E360A618699DEe14a9",
    ]);
    v.parse(HistoricalOrdersRequest, data);
  },
});
